import { prisma } from '../lib/prisma';
import { Contact } from '../../types';

class ContactRepository {
  private fallbackContacts: Map<string, Contact> = new Map();

  /**
   * Get all contacts belonging to user
   */
  async getUserContacts(userId: string): Promise<Contact[]> {
    try {
      const dbContacts = await prisma.contact.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (dbContacts.length > 0) {
        return dbContacts.map((c) => this.mapPrismaContact(c));
      }
    } catch (err) {
      // Fallback
    }

    const userList: Contact[] = [];
    this.fallbackContacts.forEach((c) => {
      if ((c as any).userId === userId) {
        userList.push(c);
      }
    });

    return userList;
  }

  /**
   * Find contact by ID
   */
  async findById(contactId: string): Promise<Contact | null> {
    try {
      const dbContact = await prisma.contact.findUnique({
        where: { id: contactId },
      });
      if (dbContact) {
        return this.mapPrismaContact(dbContact);
      }
    } catch (err) {
      // Fallback
    }
    return this.fallbackContacts.get(contactId) || null;
  }

  /**
   * Create contact for user
   */
  async createContact(userId: string, data: Omit<Contact, 'id'> & { id?: string }): Promise<Contact> {
    const contactId = data.id || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newContact: Contact = {
      ...data,
      id: contactId,
    };
    (newContact as any).userId = userId;

    this.fallbackContacts.set(contactId, newContact);

    try {
      const created = await prisma.contact.create({
        data: {
          id: contactId,
          userId,
          name: newContact.name,
          company: newContact.company,
          opportunityId: newContact.opportunityId || null,
          role: newContact.role || '',
          email: newContact.email || '',
          linkedIn: newContact.linkedIn || '',
          howMet: newContact.howMet || '',
          dateContacted: newContact.dateContacted,
          lastInteractionDate: newContact.lastInteractionDate,
          followUpDate: newContact.followUpDate || null,
          privateNotes: newContact.privateNotes || '',
        },
      });
      return this.mapPrismaContact(created);
    } catch (err) {
      return newContact;
    }
  }

  /**
   * Update contact
   */
  async updateContact(userId: string, contactId: string, data: Partial<Contact>): Promise<Contact> {
    const existing = await this.findById(contactId);
    if (!existing) {
      throw new Error(`Contact '${contactId}' not found`);
    }

    const updated: Contact = {
      ...existing,
      ...data,
    };

    this.fallbackContacts.set(contactId, updated);

    try {
      const dbUpdated = await prisma.contact.update({
        where: { id: contactId },
        data: {
          name: data.name,
          company: data.company,
          opportunityId: data.opportunityId,
          role: data.role,
          email: data.email,
          linkedIn: data.linkedIn,
          howMet: data.howMet,
          dateContacted: data.dateContacted,
          lastInteractionDate: data.lastInteractionDate,
          followUpDate: data.followUpDate,
          privateNotes: data.privateNotes,
        },
      });
      return this.mapPrismaContact(dbUpdated);
    } catch (err) {
      return updated;
    }
  }

  /**
   * Delete contact
   */
  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    this.fallbackContacts.delete(contactId);
    try {
      await prisma.contact.delete({
        where: { id: contactId },
      });
    } catch (err) {
      // Ignore
    }
    return true;
  }

  private mapPrismaContact(c: any): Contact {
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      opportunityId: c.opportunityId || undefined,
      role: c.role || '',
      email: c.email || '',
      linkedIn: c.linkedIn || '',
      howMet: c.howMet || '',
      dateContacted: c.dateContacted,
      lastInteractionDate: c.lastInteractionDate,
      followUpDate: c.followUpDate || undefined,
      privateNotes: c.privateNotes || '',
    };
  }
}

export const contactRepository = new ContactRepository();
