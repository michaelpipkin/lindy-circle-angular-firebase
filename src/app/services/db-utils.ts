import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, tap } from 'rxjs';
import {
  MEMBERS,
  PRACTICES,
  PUNCHCARDS,
  findAttendancesForPractice,
} from 'src/seed-data';

export async function importData(db: AngularFirestore): Promise<void> {
  let localMembers = [];
  let localPractices = [];
  let localPunchCards = [];
  let localAttendances = [];

  // add defaults
  const defaults = {
    doorPrice: 5,
    practiceCost: 25,
    punchCardPrice: 25,
  };
  db.doc('defaults/defaults').set(defaults);

  // add members
  const membersCollection = db.collection('members');
  for (const member of MEMBERS) {
    console.log(`Adding ${member['firstName']} ${member['lastName']}`);
    const memberRef = await membersCollection.add(member);
    localMembers.push({
      ...member,
      id: memberRef.id,
    });
  }
  const punchCardCollection = db.collection('punch-cards');
  for (const punchCard of PUNCHCARDS) {
    const newPunchCard = { ...punchCard };
    delete newPunchCard.purchaseDate;
    newPunchCard.purchaseDate = parseDate(punchCard['purchaseDate']);
    console.log(`Adding punch card ${punchCard['punchCardId']}`);
    const punchCardRef = await punchCardCollection.add(newPunchCard);
    localPunchCards.push({
      ...punchCard,
      id: punchCardRef.id,
    });
  }
  // update member ids on punch cards
  db.collectionGroup('punch-cards')
    .get()
    .subscribe((punchCards) => {
      console.log('Updating member ids on punch cards...');
      punchCards.forEach(async (punchCardDoc) => {
        const punchCard = punchCardDoc.data();
        const purchaseMember = localMembers.find(
          (f) => f.memberId == punchCard['purchaseMemberId']
        );
        const currentMember = localMembers.find(
          (f) => f.memberId == punchCard['currentMemberId']
        );
        const newPunchCard = {
          punchCardId: punchCard['punchCardId'],
          purchaseMemberId: purchaseMember.id,
          purchaseMemberName: punchCard['purchaseMemberName'],
          currentMemberId: currentMember.id,
          currentMemberName: punchCard['currentMemberName'],
          purchaseDate: punchCard['purchaseDate'],
          purchaseAmount: punchCard['purchaseAmount'],
          punchesRemaining: punchCard['punchesRemaining'],
        };
        await db.doc(punchCardDoc.ref).set(newPunchCard);
      });
    });
  // add practices
  const practicesCollection = db.collection('practices');
  for (const practice of PRACTICES) {
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
  membersCollection
    .get()
    .pipe(
      map((members) => {
        console.log('Remove memberId field from members...');
        members.forEach((memberDoc) => {
          let member = memberDoc.data();
          delete member['memberId'];
          db.doc(memberDoc.ref).set(member);
        });
      }),
      tap(() => {
        console.log('Finished removing memberId field!');
      })
    )
    .subscribe();
  // remove punchCardId field from punch cards
  punchCardCollection
    .get()
    .pipe(
      map((punchCards) => {
        console.log('Remove punchCardId field from punch cards...');
        punchCards.forEach((punchCardDoc) => {
          let punchCard = punchCardDoc.data();
          delete punchCard['punchCardId'];
          db.doc(punchCardDoc.ref).set(punchCard);
        });
      }),
      tap(() => {
        console.log('Finished removing punchCardId field!');
      })
    )
    .subscribe();
}

function parseDate(dateString: string): Date {
  let parts: unknown[] = dateString.split('-');
  return new Date(
    parts[0] as number,
    (parts[1] as number) - 1,
    parts[2] as number
  );
}
