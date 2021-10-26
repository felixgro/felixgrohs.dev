/// <reference types="cypress" />

import Projects from "../../src/projects/_projects.json";

const url = "http://localhost:5000";

describe("ProjectScroller", () => {
	before(() => cy.visit(url));

	it("contains all projects", () => {
		for (const project of Projects) {
			cy.contains(".sub-container", project.title);
		}
	});

	it("automatically starts scrolling", () => {
		let scrollPosBefore, scrollPosAfter;
		cy.get(".projects").then((conA) => {
			scrollPosBefore = conA[0].scrollLeft;
			cy.wait(25);

			cy.get(".projects").then((conB) => {
				scrollPosAfter = conB[0].scrollLeft;
				expect(scrollPosAfter).greaterThan(scrollPosBefore);
			});
		});
	});

	it("centers project on click", () => {
		cy.get(".project-anchor").then((anchors) => {
			const midAnchor = anchors[Math.floor(anchors.length / 2)];
			midAnchor.click();

			cy.wait(100).then(() => {
				const rect = midAnchor.getBoundingClientRect(),
					anchorCenter = rect.x + rect.width / 2,
					viewportCenter = Cypress.config("viewportWidth") / 2;

				assert.closeTo(anchorCenter, viewportCenter, 3);
			});
		});
	});
});

describe("ProjectDialog", () => {
	it("closes automatically on click outside", () => {
		cy.get(".project-anchor").then((anchors) => {
			const midAnchor = anchors[Math.floor(anchors.length / 2)];
			midAnchor.click();

			cy.wait(100).then(() => {
				cy.get("body").click();
			});
		});
	});
});
