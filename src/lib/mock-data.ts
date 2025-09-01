
import type { Sale, Purchase, Expense, InventoryItem, StockMovement, AirtimeTransaction, MobileMoneyTransaction } from './types';

export const mockSales: Sale[] = [];

export const mockPurchases: Purchase[] = [];

export const mockExpenses: Expense[] = [];

export const mockInventory: InventoryItem[] = [];

export const mockStockMovements: StockMovement[] = [];

export const mockAirtimeTransactions: AirtimeTransaction[] = [];

export const mockMobileMoneyTransactions: MobileMoneyTransaction[] = [];

export const mockWifiSales: Omit<Sale, 'id' | 'type' | 'category' | 'description'>[] = [
  { "date": "2024-08-21T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-21T12:00:00.000Z", "product": "Ticket Wifi 200F", "price": 200, "quantity": 1, "amount": 200, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-22T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-22T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-22T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-22T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-22T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-24T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-24T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-25T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-25T12:00:00.000Z", "product": "Ticket Wifi 200F", "price": 200, "quantity": 1, "amount": 200, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-26T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-26T12:00:00.000Z", "product": "Ticket Wifi 200F", "price": 200, "quantity": 1, "amount": 200, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-26T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-27T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-27T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-27T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-28T12:00:00.000Z", "product": "Ticket Wifi 200F", "price": 200, "quantity": 1, "amount": 200, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-28T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-28T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-29T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-29T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-29T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-31T12:00:00.000Z", "product": "Ticket Wifi 500F", "price": 500, "quantity": 1, "amount": 500, "client": "Client Wifi", "itemType": "Ticket Wifi" },
  { "date": "2024-08-31T12:00:00.000Z", "product": "Ticket Wifi 100F", "price": 100, "quantity": 1, "amount": 100, "client": "Client Wifi", "itemType": "Ticket Wifi" }
]
