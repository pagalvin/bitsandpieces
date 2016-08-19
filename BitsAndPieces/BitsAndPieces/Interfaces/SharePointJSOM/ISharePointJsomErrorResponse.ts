module Nivlag.Interfaces {

    export interface ISharePointJsomErrorResponse {
        msg: string;
        sharePointMessage: string;
        sharePointMessageArgs: SP.ClientRequestFailedEventArgs
    }

}