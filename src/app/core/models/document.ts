import { Certificate } from "./certificate";
import { Transcript } from "./transcript";

export interface UserDocument {
    transcripts: Transcript;
    certificate: Certificate;
}