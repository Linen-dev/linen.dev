import express from 'express';

jest.mock('next-connect', () => ({
  createRouter: () => express(),
  expressWrapper: (a: any) => a,
}));
