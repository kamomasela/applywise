export interface NSCSubject {
  name: string;
  category: string;
  isMaths: boolean;
  isMathsLit: boolean;
  isLifeOrientation: boolean;
}

export const NSC_SUBJECTS: NSCSubject[] = [
  // Compulsory
  { name: 'Life Orientation',                       category: 'Compulsory',    isMaths: false, isMathsLit: false, isLifeOrientation: true },

  // Mathematics
  { name: 'Mathematics',                            category: 'Mathematics',   isMaths: true,  isMathsLit: false, isLifeOrientation: false },
  { name: 'Mathematical Literacy',                  category: 'Mathematics',   isMaths: false, isMathsLit: true,  isLifeOrientation: false },
  { name: 'Technical Mathematics',                  category: 'Mathematics',   isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Languages — Home
  { name: 'Afrikaans Home Language',                category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'English Home Language',                  category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiNdebele Home Language',               category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiXhosa Home Language',                 category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiZulu Home Language',                  category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sepedi Home Language',                   category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sesotho Home Language',                  category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Setswana Home Language',                 category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'siSwati Home Language',                  category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Tshivenda Home Language',                category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Xitsonga Home Language',                 category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sign Language Home Language',            category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Languages — First Additional
  { name: 'Afrikaans First Additional Language',    category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'English First Additional Language',      category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiNdebele First Additional Language',   category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiXhosa First Additional Language',     category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'isiZulu First Additional Language',      category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sepedi First Additional Language',       category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sesotho First Additional Language',      category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Setswana First Additional Language',     category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'siSwati First Additional Language',      category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Tshivenda First Additional Language',    category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Xitsonga First Additional Language',     category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Sign Language First Additional Language',category: 'Language',      isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Sciences
  { name: 'Physical Sciences',                      category: 'Sciences',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Life Sciences',                          category: 'Sciences',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Technical Sciences',                     category: 'Sciences',      isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Social Sciences
  { name: 'Geography',                              category: 'Social Sciences', isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'History',                                category: 'Social Sciences', isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Commerce
  { name: 'Accounting',                             category: 'Commerce',       isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Business Studies',                       category: 'Commerce',       isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Economics',                              category: 'Commerce',       isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Agricultural
  { name: 'Agricultural Sciences',                  category: 'Agricultural',   isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Agricultural Technology',                category: 'Agricultural',   isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Agricultural Management Practices',      category: 'Agricultural',   isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Technical
  { name: 'Civil Technology',                       category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Electrical Technology',                  category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Mechanical Technology',                  category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Engineering Graphics and Design',        category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Computer Applications Technology',       category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Information Technology',                 category: 'Technical',      isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Hospitality / Tourism
  { name: 'Consumer Studies',                       category: 'Hospitality',    isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Hospitality Studies',                    category: 'Hospitality',    isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Tourism',                                category: 'Hospitality',    isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Arts
  { name: 'Visual Arts',                            category: 'Arts',           isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Music',                                  category: 'Arts',           isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Dramatic Arts',                          category: 'Arts',           isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Dance Studies',                          category: 'Arts',           isMaths: false, isMathsLit: false, isLifeOrientation: false },
  { name: 'Design',                                 category: 'Arts',           isMaths: false, isMathsLit: false, isLifeOrientation: false },

  // Other
  { name: 'Religion Studies',                       category: 'Other',          isMaths: false, isMathsLit: false, isLifeOrientation: false },
] as const;

export const NSC_SUBJECT_NAMES = NSC_SUBJECTS.map((s) => s.name);

export function getSubjectMeta(name: string): NSCSubject | undefined {
  return NSC_SUBJECTS.find((s) => s.name === name);
}

/** Checks if any selected subject is Mathematical Literacy (not Pure Maths). */
export function hasMathsLiteracy(subjectNames: string[]): boolean {
  return subjectNames.some((n) => {
    const meta = getSubjectMeta(n);
    return meta?.isMathsLit ?? false;
  });
}

/** Returns the English language subject name from a list, if present. */
export function getEnglishSubject(subjects: { subject_name: string; mark: number | string }[]) {
  return subjects.find((s) =>
    s.subject_name.toLowerCase().startsWith('english')
  );
}
