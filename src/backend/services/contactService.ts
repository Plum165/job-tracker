import { contactRepository } from '../repository/contactRepository';
import { Contact } from '../../types';
import { AppError } from '../middleware/errorHandler';

export class ContactService {
  async getUserContacts(userId: string): Promise<Contact[]> {
    return contactRepository.getUserContacts(userId);
  }

  async createContact(userId: string, data: any): Promise<Contact> {
    return contactRepository.createContact(userId, data);
  }

  async updateContact(userId: string, contactId: string, data: any): Promise<Contact> {
    const existing = await contactRepository.findById(contactId);
    if (!existing) {
      throw new AppError(`Contact with ID '${contactId}' not found`, 404);
    }
    return contactRepository.updateContact(userId, contactId, data);
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const existing = await contactRepository.findById(contactId);
    if (!existing) {
      throw new AppError(`Contact with ID '${contactId}' not found`, 404);
    }
    await contactRepository.deleteContact(userId, contactId);
  }
}

export const contactService = new ContactService();
