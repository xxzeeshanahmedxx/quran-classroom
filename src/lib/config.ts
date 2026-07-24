import { getEnv } from './env';

export interface SchoolConfig {
  teacherName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolEmail: string;
  teacherLocation: string;
  teacherPin: string;
  whatsappLink: string;
}

export function getSchoolConfig(context: any): SchoolConfig {
  const name = getEnv(context, 'TEACHER_NAME') || 'Asif Zubair';
  const phone = getEnv(context, 'TEACHER_PHONE') || '+92 308 4317819';
  const email = getEnv(context, 'TEACHER_EMAIL') || 'asif@livequran.academy';
  const schoolEmail = getEnv(context, 'SCHOOL_EMAIL') || 'info@livequran.academy';
  const pin = getEnv(context, 'TEACHER_PIN') || '1234';
  return {
    teacherName: name,
    teacherEmail: email,
    teacherPhone: phone,
    schoolEmail,
    teacherLocation: 'Lahore, Punjab, Pakistan',
    teacherPin: pin,
    whatsappLink: `https://wa.me/${phone.replace(/[^0-9]/g, '')}`,
  };
}
