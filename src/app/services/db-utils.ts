import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  MEMBERS,
  PRACTICES,
  findAttendancesForPractice,
  findPunchCardsForCurrentMember,
  findPunchesByPunchCard,
} from 'src/seed-data';

export async function importData(db: AngularFirestore): Promise<void> {
  let localMembers = [];
  let localPractices = [];
  let localPunchCards = [];
  let localAttendances = [];

  // add members
  const membersCollection = db.collection('members');
  for (const member of MEMBERS) {
    console.log(`Adding ${member['firstName']} ${member['lastName']}`);
    const memberRef = await membersCollection.add(member);
    localMembers.push({
      ...member,
      id: memberRef.id,
    });
    const memberPunchCards = memberRef.collection('punch-cards');
    const punchCards = findPunchCardsForCurrentMember(member['memberId']);
    // add punch cards for member
    for (const punchCard of punchCards) {
      const newPunchCard = { ...punchCard };
      delete newPunchCard.currentMemberId;
      delete newPunchCard.purchaseDate;
      newPunchCard.purchaseDate = this.parseDate(punchCard['purchaseDate']);
      console.log(`Adding punch card ${punchCard['punchCardId']}`);
      const punchCardRef = await memberPunchCards.add(newPunchCard);
      localPunchCards.push({
        ...newPunchCard,
        id: punchCardRef.id,
      });
      const punchCardPunches = punchCardRef.collection('punches');
      const punches = findPunchesByPunchCard(punchCard['punchCardId']);
      // add punches for punch card
      for (const punch of punches) {
        const newPunch = {};
        newPunch['attendanceId'] = punch['attendanceId'];
        console.log('Adding punch');
        await punchCardPunches.add(newPunch);
      }
    }
  }
  // update purchase member id on punch cards
  db.collectionGroup('punch-cards')
    .get()
    .subscribe((punchCards) => {
      console.log('Updating purchase member id on punch cards...');
      punchCards.forEach(async (punchCardDoc) => {
        const punchCard = punchCardDoc.data();
        const purchaseMember = localMembers.find(
          (f) => f.memberId == punchCard['purchaseMemberId']
        );
        const newPunchCard = {
          purchaseDate: punchCard['purchaseDate'],
          purchaseAmount: punchCard['purchaseAmount'],
          purchaseMemberId: purchaseMember.id,
        };
        await db.doc(punchCardDoc.ref).set(newPunchCard);
      });
    });
  // add practices
  const practicesCollection = db.collection('practices');
  for (let practice of PRACTICES) {
    const newPractice = { ...practice };
    delete newPractice.practiceId;
    delete newPractice.practiceDate;
    newPractice.practiceDate = this.parseDate(practice['practiceDate']);
    const practiceRef = await practicesCollection.add(newPractice);
    localPractices.push({
      ...practice,
      id: practiceRef.id,
    });
    const practiceAttendances = practiceRef.collection('attendances');
    console.log(`Adding practice number ${practice['practiceNumber']}`);
    // add attendances for practice
    const attendances = findAttendancesForPractice(practice['practiceId']);
    console.log('Adding attendances...');
    for (const attendance of attendances) {
      const newAttendance = { ...attendance };
      delete newAttendance.practiceId;
      const attendanceRef = await practiceAttendances.add(newAttendance);
      localAttendances.push({
        ...newAttendance,
        id: attendanceRef.id,
      });
    }
  }
  // update member id for attendances
  db.collectionGroup('attendances')
    .get()
    .subscribe((attendances) => {
      console.log('Updating attendance member ids...');
      attendances.forEach(async (attendanceDoc) => {
        const attendance = attendanceDoc.data();
        const member = localMembers.find(
          (f) => f.memberId == attendance['memberId']
        );
        const newAttendance = {
          memberId: member.id,
          paymentAmount: attendance['paymentAmount'],
          paymentType: attendance['paymentType'],
        };
        await db.doc(attendanceDoc.ref).set(newAttendance);
      });
    });
  // update attendance id for punches
  db.collectionGroup('punches')
    .get()
    .subscribe((punches) => {
      console.log('Updating punch attendance ids...');
      punches.forEach(async (punchDoc) => {
        const punch = punchDoc.data();
        const attendance = localAttendances.find(
          (f) => f.attendanceId == punch['attendanceId']
        );
        const newPunch = {
          attendanceId: attendance.id,
        };
        await db.doc(punchDoc.ref).set(newPunch);
      });
    });
  // remove memberId field from members
  membersCollection.get().subscribe((members) => {
    console.log('Remove memberId field from members...');
    members.forEach(async (memberDoc) => {
      let member = memberDoc.data();
      delete member['memberId'];
      await db.doc(memberDoc.ref).set(member);
    });
  });
  console.log('Finished!');
}

export function parseDate(dateString: string): Date {
  let parts: unknown[] = dateString.split('-');
  return new Date(
    parts[0] as number,
    (parts[1] as number) - 1,
    parts[2] as number
  );
}
