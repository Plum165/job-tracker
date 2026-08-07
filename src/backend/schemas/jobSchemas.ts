import { z } from 'zod';

export const createJobSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required'),
  companyLogo: z.string().trim().optional(),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  jobCategory: z.string().trim().min(1, 'Job category is required'),
  companyDescription: z.string().trim().default(''),
  companyWebsite: z.string().trim().default(''),
  applicationLink: z.string().trim().default(''),
  location: z.string().trim().min(1, 'Location is required'),
  workArrangement: z.enum(['Remote', 'Hybrid', 'On-site']).default('Hybrid'),
  employmentType: z.enum(['Internship', 'Graduate role', 'Permanent', 'Contract']).default('Graduate role'),
  openingDate: z.string().optional(),
  closingDate: z.string().min(1, 'Closing date is required'),
  generalNotes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isShared: z.boolean().default(false),
});

export const updateJobSchema = createJobSchema.partial();

export const updateApplicationStateSchema = z.object({
  status: z.string().optional(),
  priority: z.enum(['High', 'Medium', 'Low']).optional(),
  dateApplied: z.string().optional(),
  personalNotes: z.string().optional(),
  followUpDate: z.string().optional(),
  interviewDates: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      date: z.string(),
      time: z.string().optional(),
      notes: z.string().optional(),
      completed: z.boolean().optional(),
    })
  ).optional(),
  documentsPrepared: z.object({
    cvReady: z.boolean().default(false),
    coverLetterReady: z.boolean().default(false),
    portfolioIncluded: z.boolean().default(false),
    transcriptIncluded: z.boolean().default(false),
    assessmentComplete: z.boolean().default(false),
  }).optional(),
  personalLinks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
    })
  ).optional(),
});

export const createContactSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required'),
  company: z.string().trim().min(1, 'Company is required'),
  opportunityId: z.string().optional(),
  role: z.string().trim().default(''),
  email: z.string().trim().default(''),
  linkedIn: z.string().trim().default(''),
  howMet: z.string().trim().default(''),
  dateContacted: z.string().default(() => new Date().toISOString().split('T')[0]),
  lastInteractionDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  followUpDate: z.string().optional(),
  privateNotes: z.string().default(''),
});

export const updateContactSchema = createContactSchema.partial();
