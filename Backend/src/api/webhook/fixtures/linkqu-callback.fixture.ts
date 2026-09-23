/**
 * Precomputed, masked fixtures for LinkQu callbacks.
 * 
 * NOTE: These signatures are generated independently using standard HMAC-SHA256 (RFC 2104)
 * with the pre-shared secret key: 'static_fixture_secret_linkqu_key_2026'.
 * 
 * DISCLAIMER ON CONTRACT PROOF:
 * As audited in REVIEW-2026-09-23-FOLLOWUP.md, the official PDF/API contract document
 * from LinkQu is NOT included in the repository. These fixtures represent the sanitized
 * test payloads matching our fail-closed parser requirements.
 */

export const FIXTURE_SECRET_KEY = 'static_fixture_secret_linkqu_key_2026';
export const FIXTURE_CLIENT_ID = 'client_outletpulsa_linkqu_prod';

export const LINKQU_FIXTURES = {
  VA_SUCCESS: {
    partner_reff: 'DP-FIXTURE-VA-001',
    amount: 50000,
    status: 'SUCCESS',
    response_code: '00',
    client_id: FIXTURE_CLIENT_ID,
    signature: '25c9d5b78cfbbe706f2378336f1b5f46932172b7bea1b3691b4e93dd6d9abbe9',
  },
  QRIS_SUCCESS: {
    partner_reff: 'DP-FIXTURE-QRIS-002',
    amount: 25000,
    status: 'SUCCESS',
    response_code: '00',
    client_id: FIXTURE_CLIENT_ID,
    signature: '921393bac9d5e31647a797cb9a56c3fd01789f6844d07596fb4f082bf39ed1d3',
  },
  EWALLET_PENDING: {
    partner_reff: 'DP-FIXTURE-EWALLET-003',
    amount: 10000,
    status: 'PENDING',
    response_code: '00',
    client_id: FIXTURE_CLIENT_ID,
    signature: '18142315c8167dfa94b25fc53d67bea65346bb2271935bb57b7d022c17fb4cde',
  },
  VA_FAILED: {
    partner_reff: 'DP-FIXTURE-VA-004',
    amount: 75000,
    status: 'FAILED',
    response_code: '01',
    client_id: FIXTURE_CLIENT_ID,
    signature: '7e184ae215209022a7dc486ff86b96d11263df0a2f9571eee3cda7e4aed305e4',
  },
  QRIS_EXPIRED: {
    partner_reff: 'DP-FIXTURE-QRIS-005',
    amount: 30000,
    status: 'EXPIRED',
    response_code: '02',
    client_id: FIXTURE_CLIENT_ID,
    signature: 'df8885a3a6426a0c3475efb027e90502a84c689f3d03ccbd5197b4c228e5aaf7',
  },
};
