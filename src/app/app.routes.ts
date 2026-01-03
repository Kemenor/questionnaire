import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';

export const routes: Routes = [
  { path: '', component: QuestionnaireComponent },
  { path: 'admin', component: AdminComponent }
];
