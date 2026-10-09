#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/59cc3068c1483e9aca3f458d3469d120bb03924aca7964efe4fc113261b325d2/contract';
import endContract from '../../snapshots/59cc3068c1483e9aca3f458d3469d120bb03924aca7964efe4fc113261b325d2/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Deposit',
        columns: [
          col('amountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('exactAmountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('method', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentAccountId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('paymentAccountName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentAccountNumber', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('planId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('processingChargePaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('proofUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rejectionReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('reviewedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transactionReference', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Deposit_status_check_56005a61',
            "\"status\" IN ('PENDING', 'APPROVED', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Investment',
        columns: [
          col('amountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('earnedProfitPaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('endDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('frequency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nextProfitAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('planId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profitRateBps', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('startDate', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Investment_frequency_check_4cc8f810',
            "\"frequency\" IN ('DAILY', 'WEEKLY', 'MONTHLY')",
          ),
          checkExpression(
            'Investment_status_check_7337ba71',
            "\"status\" IN ('ACTIVE', 'COMPLETED', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'InvestmentPlan',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('customWithdrawalLimitsEnabled', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('dailyWithdrawalLimitPaisa', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('durationDays', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('frequency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('lifetimeWithdrawalLimitPaisa', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('maxAmountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('minAmountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profitRateBps', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('referralBonusBps', 'int4', {
            notNull: true,
            default: lit(1400),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'InvestmentPlan_frequency_check_4cc8f810',
            "\"frequency\" IN ('DAILY', 'WEEKLY', 'MONTHLY')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Notification',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isRead', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', {
            notNull: true,
            default: lit('INFO'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'PaymentAccount',
        columns: [
          col('accountName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('accountNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('gateway', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('processingChargePaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'PaymentAccount_gateway_check_2e4795dc',
            "\"gateway\" IN ('EASYPAISA', 'BANK', 'RAAST')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Referral',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('level', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('referredUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referrerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ReferralCommission',
        columns: [
          col('baseAmountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('commissionAmountPaisa', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('commissionRateBps', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('investmentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('level', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('receiverId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sourceUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('transactionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ReferralSetting',
        columns: [
          col('id', 'text', {
            notNull: true,
            default: lit('default'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('level1BonusBps', 'int4', {
            notNull: true,
            default: lit(1300),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('level2BonusBps', 'int4', {
            notNull: true,
            default: lit(500),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Transaction',
        columns: [
          col('amountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('balanceAfterPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('balanceBeforePaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('depositId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('investmentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('referenceId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('withdrawalId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Transaction_type_check_e1d6d09b',
            "\"type\" IN ('DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'PROFIT', 'REFERRAL_COMMISSION', 'REFUND')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('balancePaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerifiedAt', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isEmailVerified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referralCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('referralLevel', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('role', 'text', {
            notNull: true,
            default: lit('USER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalInvestmentPaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('totalProfitPaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('totalReferralPaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('totalWithdrawnPaisa', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_role_check_1954e8c0', "\"role\" IN ('USER', 'ADMIN')"),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'UserWithdrawalSetting',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dailyLimitPaisa', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isEnabled', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'VerificationToken',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('usedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'VerificationToken_type_check_5a4470d6',
            "\"type\" IN ('EMAIL_VERIFICATION', 'PASSWORD_RESET')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Withdrawal',
        columns: [
          col('accountDetails', 'json', { notNull: true, codecRef: { codecId: 'pg/json@1' } }),
          col('amountPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('method', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('planId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('rejectionReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('reviewedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Withdrawal_status_check_56005a61',
            "\"status\" IN ('PENDING', 'APPROVED', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'WithdrawalSetting',
        columns: [
          col('defaultDailyLimitPaisa', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('defaultLifetimeLimitPaisa', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('minWithdrawalPaisa', 'int4', {
            notNull: true,
            default: lit(50000),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Referral',
        constraint: 'Referral_referredUserId_key',
        columns: ['referredUserId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'ReferralCommission',
        constraint: 'ReferralCommission_investmentId_receiverId_key',
        columns: ['investmentId', 'receiverId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_username_key',
        columns: ['username'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_referralCode_key',
        columns: ['referralCode'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'UserWithdrawalSetting',
        constraint: 'UserWithdrawalSetting_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'VerificationToken',
        constraint: 'VerificationToken_tokenHash_key',
        columns: ['tokenHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_paymentAccountId_idx_6d12e2f9',
        columns: ['paymentAccountId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_planId_idx_5b32079a',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_reviewedBy_idx_0b622ca2',
        columns: ['reviewedBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deposit',
        index: 'Deposit_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_nextProfitAt_idx_9040e85e',
        columns: ['nextProfitAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_planId_idx_5b32079a',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Investment',
        index: 'Investment_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_isRead_idx_a2737ae3',
        columns: ['isRead'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Notification',
        index: 'Notification_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentAccount',
        index: 'PaymentAccount_gateway_idx_d24c9a9f',
        columns: ['gateway'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentAccount',
        index: 'PaymentAccount_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Referral',
        index: 'Referral_referredUserId_idx_9cd5e2dd',
        columns: ['referredUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Referral',
        index: 'Referral_referrerId_idx_cac6d89f',
        columns: ['referrerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_investmentId_idx_a040f76a',
        columns: ['investmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_receiverId_idx_fe124f44',
        columns: ['receiverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ReferralCommission',
        index: 'ReferralCommission_sourceUserId_idx_a0f1c625',
        columns: ['sourceUserId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_depositId_idx_eb20b326',
        columns: ['depositId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_investmentId_idx_a040f76a',
        columns: ['investmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_withdrawalId_idx_f4851a5d',
        columns: ['withdrawalId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'VerificationToken',
        index: 'VerificationToken_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'VerificationToken',
        index: 'VerificationToken_type_idx_b6b604ea',
        columns: ['type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'VerificationToken',
        index: 'VerificationToken_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_planId_idx_5b32079a',
        columns: ['planId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_reviewedBy_idx_0b622ca2',
        columns: ['reviewedBy'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Withdrawal',
        index: 'Withdrawal_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deposit',
        foreignKey: {
          name: 'Deposit_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deposit',
        foreignKey: {
          name: 'Deposit_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'InvestmentPlan', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deposit',
        foreignKey: {
          name: 'Deposit_paymentAccountId_fkey',
          columns: ['paymentAccountId'],
          references: { schema: 'public', table: 'PaymentAccount', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deposit',
        foreignKey: {
          name: 'Deposit_reviewedBy_fkey',
          columns: ['reviewedBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Investment',
        foreignKey: {
          name: 'Investment_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Investment',
        foreignKey: {
          name: 'Investment_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'InvestmentPlan', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Notification',
        foreignKey: {
          name: 'Notification_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Referral',
        foreignKey: {
          name: 'Referral_referrerId_fkey',
          columns: ['referrerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Referral',
        foreignKey: {
          name: 'Referral_referredUserId_fkey',
          columns: ['referredUserId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ReferralCommission',
        foreignKey: {
          name: 'ReferralCommission_receiverId_fkey',
          columns: ['receiverId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ReferralCommission',
        foreignKey: {
          name: 'ReferralCommission_sourceUserId_fkey',
          columns: ['sourceUserId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ReferralCommission',
        foreignKey: {
          name: 'ReferralCommission_investmentId_fkey',
          columns: ['investmentId'],
          references: { schema: 'public', table: 'Investment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_investmentId_fkey',
          columns: ['investmentId'],
          references: { schema: 'public', table: 'Investment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_depositId_fkey',
          columns: ['depositId'],
          references: { schema: 'public', table: 'Deposit', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_withdrawalId_fkey',
          columns: ['withdrawalId'],
          references: { schema: 'public', table: 'Withdrawal', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'UserWithdrawalSetting',
        foreignKey: {
          name: 'UserWithdrawalSetting_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'VerificationToken',
        foreignKey: {
          name: 'VerificationToken_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Withdrawal',
        foreignKey: {
          name: 'Withdrawal_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Withdrawal',
        foreignKey: {
          name: 'Withdrawal_reviewedBy_fkey',
          columns: ['reviewedBy'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Withdrawal',
        foreignKey: {
          name: 'Withdrawal_planId_fkey',
          columns: ['planId'],
          references: { schema: 'public', table: 'InvestmentPlan', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
