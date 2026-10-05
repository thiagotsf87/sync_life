-- Migration 030: libera type = 'transfer' em transactions
--
-- O app grava transferências entre contas com type = 'transfer' (TransacaoModal v3, TransacaoPainel v5,
-- migration 025: account_from_id/account_to_id "preenchidas só quando type='transfer'"), mas o CHECK original
-- (002_fase2_financas) só aceitava 'income' e 'expense'. Em qualquer ambiente, salvar uma transferência
-- falhava com violação de CHECK. Os cálculos de saldo já ignoram transferências.
--
-- Reversível: restaurar o CHECK antigo (só vale se não houver linhas type = 'transfer').

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer'));
