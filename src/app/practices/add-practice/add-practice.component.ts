import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Practice } from '@models/practice';
import { PracticeService } from '@services/practice.service';

@Component({
  selector: 'app-add-practice',
  templateUrl: './add-practice.component.html',
  styleUrls: ['./add-practice.component.scss'],
})
export class AddPracticeComponent {
  newPracticeForm = this.fb.group({
    practiceDate: [new Date(), Validators.required],
    practiceTopic: ['', Validators.required],
    practiceCost: ['', Validators.required, Validators.pattern('^(d*.)?d*$')],
    miscExpense: [0.0, Validators.pattern('^(d*.)?d*$')],
    miscRevenue: [0.0, Validators.pattern('^(d*.)?d*$')],
  });

  constructor(
    private dialogRef: MatDialogRef<AddPracticeComponent>,
    private fb: FormBuilder,
    private practiceService: PracticeService
  ) {}

  onSubmit(): void {
    const val = this.newPracticeForm.value;
    const newPractice: Partial<Practice> = {};
  }
}
