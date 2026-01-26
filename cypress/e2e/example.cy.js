import { qase } from 'cypress-qase-reporter/mocha';

describe('Suite Henrique', () => {
  qase(501,
    it('Caso de Teste 1 - Henrique via Cypress', () => {
      expect(true).to.equal(true);
    }));
    qase(502,
    it('Caso de Teste 2 - Henrique via Cypress', () => {
      expect(true).to.equal(true);
    }));
    qase(503,
    it('Caso de Teste 1 - Henrique via Cypress', () => {
      expect(true).to.equal(true);
    }));
    qase(504,
    it('Caso de Teste 1 - Henrique via Cypress', () => {
      expect(true).to.equal(false);
    }));
   qase(505,
    it('Caso de Teste 5 - Henrique via Cypress', () => {
      expect(true).to.equal(true);
    }));
     qase(506,
    it('Caso de Teste 6 - Henrique via Cypress', () => {
      expect(true).to.equal(true);
    }));
});
