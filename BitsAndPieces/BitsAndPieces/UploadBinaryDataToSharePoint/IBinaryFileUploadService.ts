module Nivlag.Interfaces {

    export interface IFileUploadSuccessResponse {
        imageUrl: string;
    }

    export interface IBinaryFileUploadService {
        UploadFileAsync (theImage: any): ng.IPromise<IFileUploadSuccessResponse>;
    }

}