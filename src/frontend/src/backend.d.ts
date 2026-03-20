import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ProspectData {
    title: string;
    recentContext: string;
    company: string;
    painPoints: Array<string>;
    companySize: bigint;
    lastName: string;
    industry: string;
    firstName: string;
}
export interface OfferData {
    targetOutcome: string;
    valueProposition: string;
    productDescription: string;
}
export type GenerateEmailsError = {
    __kind__: "httpOutcallFailed";
    httpOutcallFailed: string;
} | {
    __kind__: "aiFailed";
    aiFailed: string;
};
export type GenerateEmailsResult = {
    __kind__: "ok";
    ok: AgentResult;
} | {
    __kind__: "err";
    err: GenerateEmailsError;
};
export interface EmailVariant {
    subject: string;
    body: string;
}
export interface AgentResult {
    variantA: EmailVariant;
    variantB: EmailVariant;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    generateEmails(prospect: ProspectData, offer: OfferData, tone: string): Promise<GenerateEmailsResult>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
