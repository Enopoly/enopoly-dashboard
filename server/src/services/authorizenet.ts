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
                            resolve({
                                success: true,
                                transactionId: tResponse.getTransId(),
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
        return new Promise((resolve) => {
            const transactionRequestType = new APIContracts.TransactionRequestType();
            transactionRequestType.setTransactionType(APIContracts.TransactionTypeEnum.REFUNDTRANSACTION);

            // For refunds, previous transaction ID is usually required or card info depending on config
            // This is a simplified implementation - typically needs last 4 digits or refTransId
            transactionRequestType.setRefTransId(transactionId);
            if (amount) {
                transactionRequestType.setAmount(amount);
            }

            // Note: Refunds often require card info (last 4) in API if not settling immediately
            // For Void it's easier. Refund might need more context.
            // We'll treat this as a placeholder implementation that structures the request correctly.

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
                    resolve({
                        success: false,
                        message: "Refund failed",
                        rawResponse: response
                    });
                }
            });
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
