import OutCall "http-outcalls/outcall";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";

actor {
  // Data types
  type ProspectData = {
    firstName : Text;
    lastName : Text;
    title : Text;
    company : Text;
    industry : Text;
    companySize : Nat;
    painPoints : [Text];
    recentContext : Text;
  };

  type OfferData = {
    productDescription : Text;
    valueProposition : Text;
    targetOutcome : Text;
  };

  type EmailVariant = {
    subject : Text;
    body : Text;
  };

  type AgentResult = {
    variantA : EmailVariant;
    variantB : EmailVariant;
  };

  type GenerateEmailsError = {
    #httpOutcallFailed : Text;
    #aiFailed : Text;
  };

  type GenerateEmailsResult = {
    #ok : AgentResult;
    #err : GenerateEmailsError;
  };

  let claudeAPIKey = "pk-H-V0-jFvTzErMlM9A03h97RlBFpmWzGlw8XhNkucnV9tDZQf";
  let claudeApiUrl = "https://api.anthropic.com/v1/messages";

  system func preupgrade() {};
  system func postupgrade() {};

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func constructPrompt(prospect : ProspectData, offer : OfferData, tone : Text) : Text {
    let prospectInfo = "Prospect: " # prospect.firstName # " " # prospect.lastName # ", Title: " # prospect.title # ", Company: " # prospect.company # ", Industry: " # prospect.industry # ", Size: " # prospect.companySize.toText() # ", Context: " # prospect.recentContext;
    let offerInfo = "Product: " # offer.productDescription # ", Value: " # offer.valueProposition # ", Outcome: " # offer.targetOutcome;
    let prompt = "Generate two personalized cold outreach emails (A & B) with subject lines for the following prospect and offer. Match this tone: " # tone # ". " # prospectInfo # ". " # offerInfo # ". Respond in strict JSON: { \"variantA\": { \"subject\": \"TEXT\", \"body\": \"TEXT\" }, \"variantB\": { \"subject\": \"TEXT\", \"body\": \"TEXT\" } }";
    prompt;
  };

  func constructRequestBody(prospect : ProspectData, offer : OfferData, tone : Text) : Text {
    let prompt = constructPrompt(prospect, offer, tone);
    let body = "{ \"model\": \"claude-3-haiku-20240307\", \"max_tokens\": 2000, \"messages\": [ { \"role\": \"user\", \"content\": \"" # prompt # "\" } ] }";
    body;
  };

  func headers() : [OutCall.Header] {
    [
      {
        name = "x-api-key";
        value = claudeAPIKey;
      },
      {
        name = "anthropic-version";
        value = "2023-06-01";
      },
      {
        name = "content-type";
        value = "application/json";
      },
    ];
  };

  func parseEmails(responseJson : Text) : AgentResult {
    // TODO: Offload parsing to frontend, temporarily returning empty result
    {
      variantA = { subject = "A_SUPP"; body = "A_BODY" };
      variantB = { subject = "B_SUUP"; body = "B_BODY" };
    };
  };

  public shared ({ caller }) func generateEmails(prospect : ProspectData, offer : OfferData, tone : Text) : async GenerateEmailsResult {
    let requestBody = constructRequestBody(prospect, offer, tone);

    let result = await OutCall.httpPostRequest(claudeApiUrl, headers(), requestBody, transform);

    switch (result) {
      case ("") { return #err(#httpOutcallFailed("Failed to send request.")) };
      case (json) {
        let emails = parseEmails(json);
        #ok(emails);
      };
    };
  };
};
