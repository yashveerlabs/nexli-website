import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Skeleton, EmptyState } from '@/components/feedback';
import {
  Form,
  FormInput,
  FormSelect,
  FormDate,
  FormCheckbox,
  FormFileUpload,
  FormPage,
  FormSection,
  FormRow,
} from '@/components/form';
import { useToast } from '@/components/Toast';
import { useSession } from '@/app/providers/SessionProvider';
import { INDIAN_STATES } from '@/features/platform/meta';
import {
  useStudent,
  useGrades,
  useSections,
  useHouses,
  createStudent,
  updateStudent,
  nextAdmissionNo,
} from '@/features/school/data';
import {
  GENDER_OPTIONS,
  BLOOD_GROUPS,
  CATEGORY_OPTIONS,
  GUARDIAN_RELATIONS,
  STUDENT_STATUS_META,
} from '@/features/school/meta';
import {
  studentSchema,
  emptyStudentForm,
  studentToForm,
  formToStudent,
  type StudentFormValues,
} from './studentSchema';
import '@/features/school/school.css';

const STATUS_OPTIONS = Object.entries(STUDENT_STATUS_META).map(([value, m]) => ({ value, label: m.label }));

export function StudentFormPage({ mode }: { mode: 'new' | 'edit' }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { schoolId, uid, member, school } = useSession();
  const { data: existing, loading } = useStudent(mode === 'edit' ? schoolId : undefined, mode === 'edit' ? id : undefined);
  const [defaults, setDefaults] = useState<StudentFormValues | null>(null);

  // Build defaults (generate admission no for new students).
  useEffect(() => {
    let active = true;
    if (mode === 'edit') {
      if (existing) setDefaults(studentToForm(existing));
      return;
    }
    if (!schoolId) return;
    void nextAdmissionNo(schoolId, school?.currentAcademicYear).then((no) => {
      if (active) setDefaults(emptyStudentForm(no, school?.currentAcademicYear));
    });
    return () => {
      active = false;
    };
  }, [mode, existing, schoolId, school?.currentAcademicYear]);

  if (!schoolId) return <div className="nx-page"><EmptyState icon="school" title="No school context" /></div>;
  if (mode === 'edit' && loading) return <div className="nx-page"><Skeleton height={360} /></div>;
  if (mode === 'edit' && !existing) {
    return <div className="nx-page"><EmptyState icon="users" title="Student not found" action={<Button variant="subtle" onClick={() => navigate('/students')}>Back</Button>} /></div>;
  }
  if (!defaults) return <div className="nx-page"><Skeleton height={360} /></div>;

  const actor = { uid: uid ?? 'unknown', name: member?.name };

  return (
    <div className="nx-page">
      <Form<StudentFormValues>
        schema={studentSchema}
        defaultValues={defaults}
        onSubmit={async (values) => {
          try {
            const payload = formToStudent(values);
            if (mode === 'new') {
              const newId = await createStudent(schoolId, { ...payload, schoolId }, actor);
              toast.success('Student admitted', payload.fullName);
              navigate(`/students/${newId}`);
            } else {
              await updateStudent(schoolId, id, payload, actor);
              toast.success('Student updated', payload.fullName);
              navigate(`/students/${id}`);
            }
          } catch {
            toast.error('Could not save', 'Please try again.');
          }
        }}
      >
        <StudentFormBody mode={mode} onCancel={() => navigate(mode === 'edit' ? `/students/${id}` : '/students')} />
      </Form>
    </div>
  );
}

function StudentFormBody({ mode, onCancel }: { mode: 'new' | 'edit'; onCancel: () => void }) {
  const navigate = useNavigate();
  const { schoolId } = useSession();
  const { control, watch, formState } = useFormContext<StudentFormValues>();
  const { data: grades } = useGrades(schoolId);
  const { data: sections } = useSections(schoolId);
  const { data: houses } = useHouses(schoolId);
  const { fields, append, remove } = useFieldArray({ control, name: 'guardians' });

  const gradeId = watch('gradeId');
  const gradeOptions = grades.map((g) => ({ value: g.id, label: g.name }));
  const sectionOptions = sections.filter((s) => !gradeId || s.gradeId === gradeId).map((s) => ({ value: s.id, label: s.name }));
  const houseOptions = [{ value: '', label: 'None' }, ...houses.map((h) => ({ value: h.id, label: h.name }))];

  return (
    <FormPage
      title={mode === 'new' ? 'New admission' : 'Edit student'}
      subtitle={mode === 'new' ? 'Enrol a new student into the school.' : 'Update the student record.'}
      breadcrumbs={[{ label: 'Students', onClick: () => navigate('/students') }, { label: mode === 'new' ? 'New' : 'Edit' }]}
      onBack={onCancel}
      onCancel={onCancel}
      submitLabel={mode === 'new' ? 'Admit student' : 'Save changes'}
      submitIcon="check"
      submitting={formState.isSubmitting}
    >
      <FormSection title="Identity" description="Basic details of the student.">
        <FormFileUpload<StudentFormValues> name="photoUrl" label="Photo" kind="avatar" />
        <FormInput<StudentFormValues> name="firstName" label="First name" required placeholder="First name" />
        <FormInput<StudentFormValues> name="lastName" label="Last name" placeholder="Last name" />
        <FormSelect<StudentFormValues> name="gender" label="Gender" required placeholder="Select" options={GENDER_OPTIONS} />
        <FormDate<StudentFormValues> name="dob" label="Date of birth" />
        <FormSelect<StudentFormValues> name="bloodGroup" label="Blood group" placeholder="Select" options={BLOOD_GROUPS} />
      </FormSection>

      <FormSection title="Enrolment">
        <FormInput<StudentFormValues> name="admissionNo" label="Admission no." required />
        <FormInput<StudentFormValues> name="rollNo" label="Roll no." />
        <FormSelect<StudentFormValues> name="gradeId" label="Grade / Class" placeholder="Select grade" options={gradeOptions} />
        <FormSelect<StudentFormValues> name="sectionId" label="Section" placeholder="Select section" options={sectionOptions} />
        <FormSelect<StudentFormValues> name="house" label="House" options={houseOptions} />
        <FormSelect<StudentFormValues> name="status" label="Status" required options={STATUS_OPTIONS} />
        <FormDate<StudentFormValues> name="admissionDate" label="Admission date" />
        <FormInput<StudentFormValues> name="academicYear" label="Academic year" />
      </FormSection>

      <FormSection title="Category & identifiers">
        <FormSelect<StudentFormValues> name="category" label="Category" options={CATEGORY_OPTIONS} />
        <FormInput<StudentFormValues> name="religion" label="Religion" />
        <FormInput<StudentFormValues> name="motherTongue" label="Mother tongue" />
        <FormInput<StudentFormValues> name="nationality" label="Nationality" />
        <FormInput<StudentFormValues> name="aadhaarLast4" label="Aadhaar (last 4)" maxLength={4} inputMode="numeric" hint="Store only the last 4 digits." />
        <FormInput<StudentFormValues> name="apaarId" label="APAAR ID" />
        <FormInput<StudentFormValues> name="penId" label="PEN" />
        <div className="nx-col-full">
          <FormCheckbox<StudentFormValues> name="rteQuota" label="RTE quota admission (25% EWS/DG)" />
        </div>
      </FormSection>

      <FormSection title="Contact & address">
        <FormRow>
          <FormInput<StudentFormValues> name="address" label="Address" placeholder="House / street / area" />
        </FormRow>
        <FormInput<StudentFormValues> name="city" label="City" />
        <FormSelect<StudentFormValues> name="state" label="State" placeholder="Select state" options={INDIAN_STATES.map((s) => ({ value: s, label: s }))} />
        <FormInput<StudentFormValues> name="pincode" label="Pincode" inputMode="numeric" maxLength={6} />
      </FormSection>

      <FormSection
        title="Parents & guardians"
        description="At least one guardian is required. The primary guardian can be given a parent login later."
        single
        aside={
          <Button type="button" variant="subtle" size="sm" leftIcon="user-plus" onClick={() => append({ relation: 'mother', name: '', phone: '', email: '', occupation: '', isPrimary: false })}>
            Add guardian
          </Button>
        }
      >
        {fields.map((f, i) => (
          <div className="nx-guardian" key={f.id}>
            <div className="nx-guardian__head">
              <span className="nx-guardian__title">Guardian {i + 1}</span>
              {fields.length > 1 && (
                <button type="button" className="nx-guardian__remove" onClick={() => remove(i)} aria-label={`Remove guardian ${i + 1}`}>
                  <Icon name="x" size={14} /> Remove
                </button>
              )}
            </div>
            <div className="nx-section__grid">
              <FormSelect<StudentFormValues> name={`guardians.${i}.relation`} label="Relation" required options={GUARDIAN_RELATIONS} />
              <FormInput<StudentFormValues> name={`guardians.${i}.name`} label="Name" required />
              <FormInput<StudentFormValues> name={`guardians.${i}.phone`} label="Mobile" inputMode="numeric" />
              <FormInput<StudentFormValues> name={`guardians.${i}.email`} label="Email" />
              <FormInput<StudentFormValues> name={`guardians.${i}.occupation`} label="Occupation" />
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
                <FormCheckbox<StudentFormValues> name={`guardians.${i}.isPrimary`} label="Primary contact" />
              </div>
            </div>
          </div>
        ))}
      </FormSection>
    </FormPage>
  );
}
