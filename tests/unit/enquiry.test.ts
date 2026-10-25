import { describe, expect, it } from "vitest";
import { validateEnquiry, type EnquiryValues } from "@/lib/enquiry";

const valid: EnquiryValues = {
  name: "Alex Rivers",
  email: "alex@example.com",
  phone: "",
  projectType: "interiors",
  location: "",
  budget: "",
  timing: "",
  meeting: "",
  message: "An apartment that needs to feel calmer and lighter.",
};

describe("validateEnquiry", () => {
  it("accepts a complete enquiry", () => {
    expect(validateEnquiry(valid)).toEqual({});
  });

  it("requires name, email, project type and a meaningful message", () => {
    const errors = validateEnquiry({ ...valid, name: " ", email: "", projectType: "", message: "Hi" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "projectType"]);
  });

  it("rejects malformed emails with an example of the expected format", () => {
    expect(validateEnquiry({ ...valid, email: "alex@" }).email).toMatch(/name@example\.com/);
  });

  it("only validates the phone number when one is given", () => {
    expect(validateEnquiry({ ...valid, phone: "" }).phone).toBeUndefined();
    expect(validateEnquiry({ ...valid, phone: "+61 491 570 156" }).phone).toBeUndefined();
    expect(validateEnquiry({ ...valid, phone: "call me" }).phone).toBeDefined();
  });

  it("rejects project types that are not offered", () => {
    expect(validateEnquiry({ ...valid, projectType: "warehouse" }).projectType).toBeDefined();
  });
});
