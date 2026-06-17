import { useNavigate } from 'react-router-dom';
import { InfoCard } from '@/components/feedback';
import {
  Form, FormInput, FormTextarea, FormSelect, FormRadioGroup, FormToggle,
  FormPage, FormSection, FormRow,
} from '@/components/form';
import { useToast } from '@/components/Toast';
import { useSession } from '@/app/providers/SessionProvider';
import { createCircular } from '@/features/daily/data';
import { useGrades, useSections } from '@/features/school/data';
import { CIRCULAR_AUDIENCE_OPTIONS, CIRCULAR_CATEGORY_META } from '@/features/daily/meta';
import type { Circular, CircularCategory } from '@/types/daily';
import { circularSchema, type CircularValues } from './circularSchema';

const CATEGORY_OPTIONS = (Object.keys(CIRCULAR_CATEGORY_META) as CircularCategory[]).map((c) => ({
  value: c,
  label: CIRCULAR_CATEGORY_META[c].label,
}));

const DEFAULTS: CircularValues = {
  title: '',
  body: '',
  category: 'general',
  audience: 'whole_school',
  gradeId: '',
  sectionId: '',
  pinned: false,
  emergency: false,
};

/** Compose & publish a circular (staff). */
export function ComposeCircularPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { schoolId, uid, member } = useSession();
  const { data: grades } = useGrades(schoolId);
  const { data: sections } = useSections(schoolId);

  const gradeName = (gid?: string) => grades.find((g) => g.id === gid)?.name;

  return (
    <div className="nx-page">
      <Form<CircularValues>
        schema={circularSchema}
        defaultValues={DEFAULTS}
        onSubmit={async (values) => {
          if (!schoolId) return;
          try {
            const payload: Omit<Circular, 'id' | 'schoolId'> = {
              title: values.title.trim(),
              body: values.body.trim(),
              category: values.emergency ? 'emergency' : values.category,
              audience: values.audience,
              gradeId: values.audience === 'grade' ? values.gradeId || undefined : undefined,
              sectionId: values.audience === 'section' ? values.sectionId || undefined : undefined,
              pinned: values.pinned || undefined,
              emergency: values.emergency || undefined,
              publishedAt: Date.now(),
              publishedByUid: uid ?? undefined,
              publishedByName: member?.name,
            };
            await createCircular(schoolId, payload as Omit<Circular, 'id'>, { uid: uid ?? 'unknown', name: member?.name });
            toast.success('Circular published', values.title.trim());
            navigate('/communication');
          } catch {
            toast.error('Could not publish', 'Please try again.');
          }
        }}
      >
        {({ watch, formState }) => {
          const audience = watch('audience');
          const emergency = watch('emergency');
          return (
            <FormPage
              title="New circular"
              subtitle="Publish an announcement to your school community."
              breadcrumbs={[
                { label: 'Communication', onClick: () => navigate('/communication') },
                { label: 'New' },
              ]}
              onBack={() => navigate('/communication')}
              onCancel={() => navigate('/communication')}
              submitLabel="Publish circular"
              submitIcon="send"
              submitting={formState.isSubmitting}
            >
              <FormSection title="Message">
                <FormRow>
                  <FormInput<CircularValues> name="title" label="Title" required placeholder="e.g. Annual Day rehearsal schedule" />
                </FormRow>
                <FormRow>
                  <FormTextarea<CircularValues> name="body" label="Message" required rows={6} placeholder="What do you want to announce?" />
                </FormRow>
                <FormRow>
                  <FormRadioGroup<CircularValues> name="category" label="Category" required options={CATEGORY_OPTIONS} variant="inline" />
                </FormRow>
                {emergency && (
                  <FormRow>
                    <InfoCard icon="alert-triangle" title="Marked as emergency">
                      Emergency circulars are visually emphasised and pinned to the top of every recipient&apos;s inbox.
                    </InfoCard>
                  </FormRow>
                )}
              </FormSection>

              <FormSection title="Audience">
                <FormSelect<CircularValues> name="audience" label="Who should see this?" required options={CIRCULAR_AUDIENCE_OPTIONS} />
                {audience === 'grade' && (
                  <FormSelect<CircularValues>
                    name="gradeId"
                    label="Grade"
                    required
                    placeholder="Select a grade"
                    options={grades.map((g) => ({ value: g.id, label: g.name }))}
                  />
                )}
                {audience === 'section' && (
                  <FormSelect<CircularValues>
                    name="sectionId"
                    label="Section"
                    required
                    placeholder="Select a section"
                    options={sections.map((s) => ({ value: s.id, label: `${gradeName(s.gradeId) ?? ''} ${s.name}`.trim() }))}
                  />
                )}
              </FormSection>

              <FormSection title="Delivery">
                <FormRow>
                  <FormToggle<CircularValues> name="pinned" label="Pin to top" description="Keep this circular at the top of the inbox." />
                </FormRow>
                <FormRow>
                  <FormToggle<CircularValues> name="emergency" label="Mark as emergency" description="Highlight with a danger accent and pin to the top." />
                </FormRow>
                <FormRow>
                  <InfoCard icon="info" title="Delivered in-app">
                    Circulars appear instantly in the in-app inbox for the chosen audience. Push, WhatsApp and SMS are feature-flagged delivery channels that will be enabled later.
                  </InfoCard>
                </FormRow>
              </FormSection>
            </FormPage>
          );
        }}
      </Form>
    </div>
  );
}
