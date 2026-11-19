import type { Page } from "./pdf";

// Fictional sample document so the demo works without an upload.
export const SAMPLE_TITLE = "Northwind Outdoor Co. (fictional) customer policy";
export const SAMPLE_PAGES: Page[] = [
  { page: 1, text: "Northwind Outdoor Co. Customer Policy. This document explains how orders, shipping and returns work for customers of Northwind Outdoor Co., a fictional retailer used for this demonstration." },
  { page: 2, text: "Shipping. Standard shipping takes 5 to 7 business days and is free on orders over $75. Express shipping takes 2 business days and costs $14. We ship to the United States and Canada only." },
  { page: 3, text: "Returns. Customers may return unused items within 30 days of delivery for a full refund. Return shipping is free for defective items. Customers pay return shipping for all other returns. Refunds are issued to the original payment method within 7 business days of receiving the item." },
  { page: 4, text: "Warranty. Tents and sleeping bags carry a two year warranty against manufacturing defects. Backpacks carry a lifetime warranty on zippers and stitching. Normal wear and damage from misuse are not covered." },
];
