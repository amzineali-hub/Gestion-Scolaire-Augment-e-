import { Student, Teacher, Invoice } from "../types";

export const generateMoroccanStudents = (
  baseStudents: Student[],
): Student[] => {
  const boys = [
    "Amine",
    "Omar",
    "Mehdi",
    "Reda",
    "Saad",
    "Youssef",
    "Tarik",
    "Hamza",
    "Karim",
    "Anass",
    "Othmane",
    "Zakaria",
    "Ayoub",
    "Walid",
    "Elias",
    "Sami",
    "Yassine",
  ];
  const girls = [
    "Yasmine",
    "Ghita",
    "Sofia",
    "Kawtar",
    "Salma",
    "Malak",
    "Douae",
    "Lina",
    "Rim",
    "Aya",
    "Hiba",
    "Rania",
    "Kenza",
    "Ines",
    "Sarah",
  ];
  const lastNames = [
    "Alami",
    "Cherkaoui",
    "Filali",
    "Kadiri",
    "Bennani",
    "El Idrissi",
    "Belkhayat",
    "Slaoui",
    "Bouazzaoui",
    "Tazi",
    "Berrada",
    "Mansouri",
    "Chraibi",
    "Daoudi",
    "Senhaji",
    "Fassi",
    "Guessous",
  ];

  const result = [...baseStudents];
  const classes = ["cls-1", "cls-2", "cls-3", "cls-4", "cls-5", "cls-6"];

  let counter = result.length + 1;
  while (result.length < 500) {
    const isGirl = Math.random() > 0.5;
    const firstName = isGirl
      ? girls[Math.floor(Math.random() * girls.length)]
      : boys[Math.floor(Math.random() * boys.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const classId = classes[Math.floor(Math.random() * classes.length)];
    const parentFirstName = boys[Math.floor(Math.random() * boys.length)];
    const status =
      Math.random() > 0.08
        ? "actif"
        : Math.random() > 0.5
          ? "suspendu"
          : "archivé";

    // Services options
    const transportOption = Math.random() > 0.65;
    const canteenOption = Math.random() > 0.55;
    const tutoringOption = Math.random() > 0.75;
    const sportOption = Math.random() > 0.8;
    const smsOption = Math.random() > 0.45;
    const insuranceOption = Math.random() > 0.35;

    const possibleMissingDocs = [
      "Certificat médical",
      "Photos d'identité",
      "Extrait d'acte de naissance",
      "Livret de santé",
      "Attestation de scolarité précédente",
    ];
    const missingDocuments: string[] = [];
    if (Math.random() > 0.85) {
      const numDocs = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numDocs; i++) {
        const doc =
          possibleMissingDocs[
            Math.floor(Math.random() * possibleMissingDocs.length)
          ];
        if (!missingDocuments.includes(doc)) missingDocuments.push(doc);
      }
    }

    // outstandingBalance for status
    let outstandingBalance = 0;
    if (status === "suspendu") {
      outstandingBalance = Math.random() > 0.5 ? 4800 : 2200;
    } else if (status === "actif") {
      outstandingBalance = Math.random() > 0.9 ? 2400 : 0;
    }

    result.push({
      id: `std-gen-${counter}`,
      firstName,
      lastName,
      classId,
      parentName: `${parentFirstName} ${lastName}`,
      parentPhone: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
      parentEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      registrationDate: `2025-09-${String(Math.floor(Math.random() * 20) + 1).padStart(2, "0")}`,
      status,
      outstandingBalance,
      transportOption,
      canteenOption,
      tutoringOption,
      sportOption,
      smsOption,
      insuranceOption,
      missingDocuments:
        missingDocuments.length > 0 ? missingDocuments : undefined,
    });
    counter++;
  }
  return result;
};

export const generateMoroccanTeachers = (
  baseTeachers: Teacher[],
): Teacher[] => {
  const firstNames = [
    "Abdelilah",
    "Nadia",
    "Rachid",
    "Fatima-Zahra",
    "Khalid",
    "Mohamed",
    "Hassan",
    "Samira",
    "Khadija",
    "Mustapha",
    "Naoual",
    "Youssef",
    "Meryem",
    "Latifa",
    "Said",
    "Adil",
    "Amal",
    "Brahim",
    "Jamal",
    "Noureddine",
    "Karim",
    "Zouhair",
    "Asmae",
    "Fouad",
  ];
  const lastNames = [
    "El Amrani",
    "Benjelloun",
    "Tazi",
    "Bensouda",
    "Alaoui",
    "Mansouri",
    "Slaoui",
    "El Idrissi",
    "Berrada",
    "Cherkaoui",
    "Kadiri",
    "Bennani",
    "Filali",
    "Alami",
    "Fassi",
    "Chraibi",
    "Guessous",
    "Mezouar",
  ];

  const result = [...baseTeachers];
  const subjects = [
    "sub-1",
    "sub-2",
    "sub-3",
    "sub-4",
    "sub-5",
    "sub-6",
    "sub-7",
    "sub-8",
    "sub-9",
    "sub-10",
    "sub-11",
    "sub-12",
    "sub-13",
  ];
  const classes = ["cls-1", "cls-2", "cls-3", "cls-4", "cls-5", "cls-6"];

  let counter = result.length + 1;
  while (result.length < 50) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    const numSubs = Math.floor(Math.random() * 2) + 1;
    const teacherSubs: string[] = [];
    while (teacherSubs.length < numSubs) {
      const sub = subjects[Math.floor(Math.random() * subjects.length)];
      if (!teacherSubs.includes(sub)) teacherSubs.push(sub);
    }

    const numClasses = Math.floor(Math.random() * 2) + 1;
    const teacherClasses: string[] = [];
    while (teacherClasses.length < numClasses) {
      const cls = classes[Math.floor(Math.random() * classes.length)];
      if (!teacherClasses.includes(cls)) teacherClasses.push(cls);
    }

    const salaryType = Math.random() > 0.2 ? "mensuel" : "horaire";
    const salaryValue =
      salaryType === "mensuel"
        ? Math.floor(7000 + Math.random() * 3500)
        : Math.floor(150 + Math.random() * 80);

    result.push({
      id: `tch-gen-${counter}`,
      firstName,
      lastName,
      email: `${firstName.charAt(0).toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "")}@madrasati.ma`,
      phone: `06${Math.floor(60000000 + Math.random() * 30000000)}`,
      subjectIds: teacherSubs,
      classIds: teacherClasses,
      salaryType,
      salaryValue,
      status: "actif",
    });
    counter++;
  }
  return result;
};

export const generateSimulatedInvoices = (students: Student[]): Invoice[] => {
  const result: Invoice[] = [];
  const months = ["Mai 2026", "Juin 2026"];
  const paymentMethods: ("Carte" | "Espèces" | "Chèque" | "Virement")[] = [
    "Chèque",
    "Virement",
    "Espèces",
    "Carte",
  ];

  let counter = 1;
  const numInvoices = 220;
  for (let i = 0; i < numInvoices; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const month = months[Math.floor(Math.random() * months.length)];

    let amount = 2000;
    if (student.classId === "cls-1") amount = 2200;
    else if (student.classId === "cls-2") amount = 2400;
    else if (student.classId === "cls-3") amount = 2800;
    else if (student.classId === "cls-4") amount = 2700;
    else if (student.classId === "cls-5") amount = 3500;
    else if (student.classId === "cls-6") amount = 3200;

    amount += student.transportOption ? 400 : 0;
    amount += student.canteenOption ? 500 : 0;
    amount += student.tutoringOption ? 300 : 0;
    amount += student.sportOption ? 250 : 0;
    amount += student.smsOption ? 50 : 0;
    amount += student.insuranceOption ? 100 : 0;

    const statusSeed = Math.random();
    const status =
      statusSeed > 0.45 ? "payé" : statusSeed > 0.15 ? "impayé" : "retard";

    const invoice: Invoice = {
      id: `inv-sim-${counter}-${i}`,
      studentId: student.id,
      month,
      amount,
      dueDate: month === "Mai 2026" ? "2026-05-10" : "2026-06-10",
      status,
    };

    if (status === "payé") {
      invoice.paymentDate = month === "Mai 2026" ? "2026-05-08" : "2026-06-07";
      invoice.paymentMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    }

    result.push(invoice);
    counter++;
  }
  return result;
};
