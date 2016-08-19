module JJ.BusinessPanorama.Interfaces {

    export interface ISharePointJsomErrorResponse {
        msg: string;
        sharePointMessage: string;
        sharePointMessageArgs: SP.ClientRequestFailedEventArgs
    }

}