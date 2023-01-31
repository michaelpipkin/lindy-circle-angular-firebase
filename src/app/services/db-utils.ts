import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  MEMBERS,
  PRACTICES,
  findAttendancesForPractice,
  findPunchCardsForCurrentMember,
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
      newPunchCard.purchaseDate = parseDate(punchCard['purchaseDate']);
      console.log(`Adding punch card ${punchCard['punchCardId']}`);
      const punchCardRef = await memberPunchCards.add(newPunchCard);
      localPunchCards.push({
        ...newPunchCard,
        id: punchCardRef.id,
      });
      // const punchCardPunches = punchCardRef.collection('punches');
      // const punches = findPunchesByAttendance(punchCard['punchCardId']);
      // // add punches for punch card
      // for (const punch of punches) {
      //   const newPunch = {};
      //   newPunch['attendanceId'] = punch['attendanceId'];
      //   console.log('Adding punch');
      //   await punchCardPunches.add(newPunch);
      // }
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
    newPractice.practiceDate = parseDate(practice['practiceDate']);
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
  // update member id and punch card id for attendances
  db.collectionGroup('attendances')
    .get()
    .subscribe((attendances) => {
      console.log('Updating attendance member ids and punch card ids...');
      attendances.forEach(async (attendanceDoc) => {
        const attendance = attendanceDoc.data();
        const member = localMembers.find(
          (f) => f.memberId == attendance['memberId']
        );
        const punchCard = localPunchCards.find(
          (f) => f.punchCardId == attendance['punchCardId']
        );
        if (punchCard == undefined) {
          const newAttendance = {
            memberId: member.id,
            paymentAmount: attendance['paymentAmount'],
            paymentType: attendance['paymentType'],
          };
          await db.doc(attendanceDoc.ref).set(newAttendance);
        } else {
          const newAttendance = {
            memberId: member.id,
            paymentAmount: attendance['paymentAmount'],
            paymentType: attendance['paymentType'],
            punchCardId: punchCard.id,
          };
          await db.doc(attendanceDoc.ref).set(newAttendance);
        }
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

function parseDate(dateString: string): Date {
  let parts: unknown[] = dateString.split('-');
  return new Date(
    parts[0] as number,
    (parts[1] as number) - 1,
    parts[2] as number
  );
}
