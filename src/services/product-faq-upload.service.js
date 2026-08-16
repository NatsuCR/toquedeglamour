import { borrarUploads } from './producto-upload.service.js';
import {
  productFaqCreateInput,
  productFaqEntries
} from './product-faq-input.service.js';

function parseWithCleanup(parser, data, files) {
  try {
    return parser(data);
  } catch (error) {
    borrarUploads(files);
    throw error;
  }
}

export const faqCreateWithUploads = (data, files) => (
  parseWithCleanup(productFaqCreateInput, data, files)
);

export const faqEntriesWithUploads = (data, files) => (
  parseWithCleanup(productFaqEntries, data, files)
);
