describe("Exchange calculation tests", () => {
  it("Handle empty amount", () => {
    cy.visit("http://localhost:3000");
    cy.get('input').clear()
    cy.get('button').click()
    cy.contains('Wrong amount')
  });

  it("Handle zero value in amount", () => {
    cy.visit("http://localhost:3000");
    cy.get("input").type("0");
    cy.get("button").click();
    cy.contains("Wrong amount");
  });
});
