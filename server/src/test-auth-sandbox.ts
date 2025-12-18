
import dotenv from 'dotenv';
import { APIContracts, APIControllers } from 'authorizenet';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("------------------------------------------");
console.log("Testing Authorize.Net Connection (SANDBOX)");
console.log("------------------------------------------");
console.log("Environment:", process.env.AUTHORIZENET_ENVIRONMENT || 'Not Set');
console.log("Login ID:", process.env.AUTHORIZENET_API_LOGIN_ID ? "Found (Starts with " + process.env.AUTHORIZENET_API_LOGIN_ID.substring(0, 3) + ")" : "MISSING");
console.log("Trans Key:", process.env.AUTHORIZENET_TRANSACTION_KEY ? "Found" : "MISSING");
console.log("------------------------------------------");

function testConnection() {
    const merchantAuthenticationType = new APIContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.AUTHORIZENET_API_LOGIN_ID!);
    merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY!);

    const getRequest = new APIContracts.GetMerchantDetailsRequest();
    getRequest.setMerchantAuthentication(merchantAuthenticationType);

    const ctrl = new APIControllers.GetMerchantDetailsController(getRequest.getJSON());

    // Set Environment based on .env
    const env = process.env.AUTHORIZENET_ENVIRONMENT?.toUpperCase() || 'SANDBOX';
    const apiUrl = env === 'PRODUCTION'
        ? "https://api2.authorize.net/xml/v1/request.api"
        : "https://apitest.authorize.net/xml/v1/request.api";

    ctrl.setEnvironment(apiUrl);

    console.log(`Sending request to Authorize.Net ${env}...`);

    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.GetMerchantDetailsResponse(apiResponse);

        if (response != null) {
            if (response.getMessages().getResultCode() == APIContracts.MessageTypeEnum.OK) {
                console.log("\n✅ SUCCESS: Connection Established!");
                // console.log("Merchant Name:", response.getMerchantDetails().publicClientName);
            } else {
                console.log("\n❌ FAILED: Connection Rejected");
                console.log("Error Code:", response.getMessages().getMessage()[0].getCode());
                console.log("Error Message:", response.getMessages().getMessage()[0].getText());
            }
        } else {
            console.log("\n❌ FAILED: No response from Authorize.Net");
        }
    });
}

testConnection();
