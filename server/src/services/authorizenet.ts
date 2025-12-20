import { APIContracts, APIControllers } from "authorizenet";
import { PaymentGateway, PaymentResult, CardData } from "../interfaces/payment";

export class AuthorizeNetService implements PaymentGateway {
    private merchantAuthenticationType: APIContracts.MerchantAuthenticationType;
    private environment: string;

    constructor() {
        this.merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
        this.merchantAuthenticationType.setName(process.env.AUTHORIZENET_API_LOGIN_ID!);
        this.merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY!);

        this.environment = process.env.AUTHORIZENET_ENVIRONMENT || "SANDBOX";
    }

    async charge(amount: number, cardData: CardData, invoiceId: string): Promise<PaymentResult> {
        return new Promise((resolve) => {
            const creditCard = new APIContracts.CreditCardType();
            creditCard.setCardNumber(cardData.cardNumber);
            creditCard.setExpirationDate(cardData.expirationDate);
            creditCard.setCardCode(cardData.cvv);

            const paymentType = new APIContracts.PaymentType();
            paymentType.setCreditCard(creditCard);

            const orderDetails = new APIContracts.OrderType();
            orderDetails.setInvoiceNumber(invoiceId);
            orderDetails.setDescription(`Payment for Invoice ${invoiceId}`);

            const customer = new APIContracts.CustomerDataType();
            if (cardData.email) {
                customer.setEmail(cardData.email);
            }

            const transactionRequestType = new APIContracts.TransactionRequestType();
            transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
            transactionRequestType.setPayment(paymentType);
            transactionRequestType.setAmount(amount);
            transactionRequestType.setOrder(orderDetails);
            transactionRequestType.setCustomer(customer);

            const createRequest = new APIContracts.CreateTransactionRequest();
            createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
            createRequest.setTransactionRequest(transactionRequestType);

            const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());

            // Set environment
            if (this.environment === 'PRODUCTION') {
                ctrl.setEnvironment("https://api2.authorize.net/xml/v1/request.api");
            } else {
                ctrl.setEnvironment("https://apitest.authorize.net/xml/v1/request.api");
            }

            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                const response = new APIContracts.CreateTransactionResponse(apiResponse);

                if (response != null) {
                    if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
                        const tResponse = response.getTransactionResponse();

                        if (tResponse != null && tResponse.getMessages() != null) {
                            const transId = tResponse.getTransId();
                            console.log(`[DEBUG] Charge Successful. Raw Transaction ID from AuthNet: ${transId}`);
                            resolve({
                                success: true,
                                transactionId: transId,
                                message: `Successfully charged: ${tResponse.getMessages().getMessage()[0].getDescription()}`,
                                rawResponse: response
                            });
                        } else {
                            let errorMessage = "Failed Transaction";
                            const errors = [];
                            if (response.getMessages().getMessage()[0].getCode() == "2") {
                                errorMessage = "This transaction has been declined.";
                                errors.push(errorMessage);
                            }
                            if (tResponse.getErrors() != null) {
                                tResponse.getErrors().getError().forEach((item: any) => {
                                    errors.push(`${item.getErrorCode()}: ${item.getErrorText()}`);
                                });
                                errorMessage = tResponse.getErrors().getError()[0].getErrorText();
                            }
                            resolve({
                                success: false,
                                message: errorMessage,
                                errors: errors,
                                rawResponse: response
                            });
                        }
                    } else {
                        let errorMessage = "Failed Transaction";
                        const errors = [];
                        if (response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null) {
                            response.getTransactionResponse().getErrors().getError().forEach((item: any) => {
                                errors.push(`${item.getErrorCode()}: ${item.getErrorText()}`);
                            });
                            errorMessage = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
                        } else {
                            const message = response.getMessages().getMessage()[0];
                            errorMessage = `${message.getCode()}: ${message.getText()}`;
                            errors.push(errorMessage);
                        }
                        resolve({
                            success: false,
                            message: errorMessage,
                            errors: errors,
                            rawResponse: response
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        message: "No response from gateway",
                        errors: ["Null response from Authorize.Net"]
                    });
                }
            });
        });
    }

    async refund(transactionId: string, amount?: number): Promise<PaymentResult> {
        return new Promise(async (resolve) => {
            try {
                // First, get the transaction details to retrieve card info and amount
                const getRequest = new APIContracts.GetTransactionDetailsRequest();
                getRequest.setMerchantAuthentication(this.merchantAuthenticationType);
                getRequest.setTransId(transactionId);

                const getCtrl = new APIControllers.GetTransactionDetailsController(getRequest.getJSON());

                if (this.environment === 'PRODUCTION') {
                    getCtrl.setEnvironment("https://api2.authorize.net/xml/v1/request.api");
                } else {
                    getCtrl.setEnvironment("https://apitest.authorize.net/xml/v1/request.api");
                }

                getCtrl.execute(() => {
                    const getResponse = getCtrl.getResponse();
                    const txnDetails = new APIContracts.GetTransactionDetailsResponse(getResponse);

                    if (!txnDetails || txnDetails.getMessages().getResultCode() !== APIContracts.MessageTypeEnum.OK) {
                        let errorMsg = "Could not retrieve transaction details for refund";
                        if (txnDetails && txnDetails.getMessages()) {
                            const msg = txnDetails.getMessages().getMessage()[0];
                            errorMsg += `: ${msg.getCode()} - ${msg.getText()}`;
                        }
                        console.error(`GetTransactionDetails Failed for ID: ${transactionId}. Error: ${errorMsg}`);
                        resolve({
                            success: false,
                            message: errorMsg
                        });
                        return;
                    }

                    const transaction = txnDetails.getTransaction();
                    const refundAmount = amount || parseFloat(transaction.getSettleAmount());

                    // Get card info from original transaction
                    const payment = transaction.getPayment();
                    const creditCard = new APIContracts.CreditCardType();

                    // Use last 4 digits from the original transaction
                    const cardNumber = payment.getCreditCard().getCardNumber();
                    const last4 = cardNumber.slice(-4);
                    creditCard.setCardNumber(last4);
                    creditCard.setExpirationDate("XXXX"); // Masked expiration

                    const paymentType = new APIContracts.PaymentType();
                    paymentType.setCreditCard(creditCard);

                    const transactionRequestType = new APIContracts.TransactionRequestType();
                    transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);
                    transactionRequestType.setPayment(paymentType);
                    transactionRequestType.setAmount(refundAmount);
                    transactionRequestType.setRefTransId(transactionId);

                    const createRequest = new APIContracts.CreateTransactionRequest();
                    createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
                    createRequest.setTransactionRequest(transactionRequestType);

                    const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
                    if (this.environment === 'PRODUCTION') {
                        ctrl.setEnvironment("https://api2.authorize.net/xml/v1/request.api");
                    } else {
                        ctrl.setEnvironment("https://apitest.authorize.net/xml/v1/request.api");
                    }

                    ctrl.execute(() => {
                        const apiResponse = ctrl.getResponse();
                        const response = new APIContracts.CreateTransactionResponse(apiResponse);

                        if (response != null && response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
                            resolve({
                                success: true,
                                message: "Refund successful",
                                transactionId: response.getTransactionResponse().getTransId(),
                                rawResponse: response
                            });
                        } else {
                            // Smart Refund: Check if it failed because it needs to be Voided (Unsettled)
                            // Error 54: The referenced transaction does not meet the criteria for issuing a credit.
                            let isUnsettled = false;
                            let errorDetails: string[] = [];

                            console.log("Refund failed, analyzing error response...");

                            if (response.getTransactionResponse() && response.getTransactionResponse().getErrors()) {
                                const errors = response.getTransactionResponse().getErrors().getError();
                                errors.forEach((err: any) => {
                                    const errorCode = err.getErrorCode();
                                    const errorText = err.getErrorText();
                                    console.log(`Error Code: ${errorCode} (type: ${typeof errorCode}), Text: ${errorText}`);
                                    errorDetails.push(`${errorCode}: ${errorText}`);

                                    // Check both string and number formats
                                    if (errorCode === "54" || errorCode === 54) {
                                        isUnsettled = true;
                                    }
                                });
                            } else if (response.getMessages()) {
                                const messages = response.getMessages().getMessage();
                                messages.forEach((msg: any) => {
                                    console.log(`Message Code: ${msg.getCode()}, Text: ${msg.getText()}`);
                                    errorDetails.push(`${msg.getCode()}: ${msg.getText()}`);
                                });
                            }

                            if (isUnsettled) {
                                console.log("Transaction unsettled (Error 54), attempting VOID instead of Refund...");
                                // Call void() internally
                                this.void(transactionId).then(voidResult => {
                                    if (voidResult.success) {
                                        voidResult.message = "Refund successful (via Void)"; // Mask as refund for UI simplicity
                                    }
                                    resolve(voidResult);
                                }).catch(voidError => {
                                    console.error("Void also failed:", voidError);
                                    resolve({
                                        success: false,
                                        message: "Both refund and void failed: " + errorDetails.join("; "),
                                        rawResponse: response
                                    });
                                });
                            } else {
                                // Extract error message
                                let errorMsg = "Refund failed";
                                if (errorDetails.length > 0) {
                                    errorMsg = errorDetails[0]; // Use the first error
                                }

                                console.error("Refund failed with errors:", errorDetails);

                                resolve({
                                    success: false,
                                    message: errorMsg,
                                    rawResponse: response
                                });
                            }
                        }
                    });
                });
            } catch (error) {
                console.error("Error in refund process:", error);
                resolve({
                    success: false,
                    message: "Error processing refund: " + (error as Error).message
                });
            }
        });
    }

    async void(transactionId: string): Promise<PaymentResult> {
        return new Promise((resolve) => {
            const transactionRequestType = new APIContracts.TransactionRequestType();
            transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.VOIDTRANSACTION);
            transactionRequestType.setRefTransId(transactionId);

            const createRequest = new APIContracts.CreateTransactionRequest();
            createRequest.setMerchantAuthentication(this.merchantAuthenticationType);
            createRequest.setTransactionRequest(transactionRequestType);

            const ctrl = new APIControllers.CreateTransactionController(createRequest.getJSON());
            if (this.environment === 'PRODUCTION') {
                ctrl.setEnvironment("https://api2.authorize.net/xml/v1/request.api");
            } else {
                ctrl.setEnvironment("https://apitest.authorize.net/xml/v1/request.api");
            }

            ctrl.execute(() => {
                const apiResponse = ctrl.getResponse();
                const response = new APIContracts.CreateTransactionResponse(apiResponse);

                if (response != null && response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
                    resolve({
                        success: true,
                        message: "Void successful",
                        transactionId: response.getTransactionResponse().getTransId(),
                        rawResponse: response
                    });
                } else {
                    resolve({
                        success: false,
                        message: "Void failed",
                        rawResponse: response
                    });
                }
            });
        });
    }
}
