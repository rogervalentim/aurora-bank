import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { employmentTypeSchema, isValidCpf, onlyDigits } from '@aurora/shared';
import type { EmploymentType } from '@aurora/shared';
import { Screen } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { CpfInput, MoneyInput } from '@/components/ui/inputs';
import { ErrorState } from '@/components/ui/states';
import { EMPLOYMENT_LABEL } from '@/lib/labels';
import { brlFromCents } from '@/lib/format';
import { openAccount } from '@/services/banking';
import { saveSession } from '@/services/session';
import { normalizeError } from '@/services/http';
import { cn } from '@/lib/cn';

type Step = 0 | 1 | 2;

interface FormState {
  fullName: string;
  cpf: string;
  email: string;
  incomeCents: number;
  employmentType: EmploymentType;
}

const EMPLOYMENTS = employmentTypeSchema.options;

/** Onboarding financeiro em 3 passos: dados, vínculo e revisão. */
export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<FormState>({
    fullName: '',
    cpf: '',
    email: '',
    incomeCents: 0,
    employmentType: 'CLT',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepError = useMemo(() => {
    if (step === 0) {
      if (form.fullName.trim().length < 5) return 'Informe seu nome completo.';
      if (!isValidCpf(form.cpf)) return 'CPF inválido. Confira os 11 dígitos.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Informe um e-mail válido.';
    }
    if (step === 1 && form.incomeCents < 50_000) return 'Informe uma renda mensal a partir de R$ 500,00.';
    return null;
  }, [step, form]);

  const next = () => {
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setStep((current) => (current === 2 ? 2 : ((current + 1) as Step)));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const account = await openAccount({
        fullName: form.fullName.trim(),
        cpf: onlyDigits(form.cpf),
        email: form.email.trim().toLowerCase(),
        monthlyIncome: form.incomeCents / 100,
        employmentType: form.employmentType,
      });
      await saveSession({
        userId: account.userId,
        fullName: account.fullName,
        accountId: account.id,
        email: account.email,
      });
      router.replace('/home');
    } catch (cause) {
      setError(normalizeError(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      title="Abrir sua conta"
      subtitle="Três passos rápidos. A aprovação do KYC é feita pelo nosso time de risco."
      testID="onboarding-screen"
    >
      <View className="mb-5 flex-row gap-2">
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            className={cn('h-1.5 flex-1 rounded-full', index <= step ? 'bg-accent' : 'bg-slate-200')}
            testID={`onboarding-progress-${index}`}
          />
        ))}
      </View>

      {error ? (
        <View className="mb-4">
          <ErrorState message={error} />
        </View>
      ) : null}

      {step === 0 ? (
        <Card className="gap-4">
          <Text variant="title">Seus dados</Text>
          <Field
            label="Nome completo"
            value={form.fullName}
            onChangeText={(fullName) => setForm({ ...form, fullName })}
            placeholder="Como está no documento"
            autoCapitalize="words"
          />
          <CpfInput value={form.cpf} onChange={(cpf) => setForm({ ...form, cpf })} />
          <Field
            label="E-mail"
            value={form.email}
            onChangeText={(email) => setForm({ ...form, email })}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="gap-4">
          <Text variant="title">Sua renda</Text>
          <Text variant="caption">
            É com base na renda declarada que calculamos a margem consignável de 35%.
          </Text>
          <MoneyInput
            label="Renda mensal"
            valueCents={form.incomeCents}
            onChangeCents={(incomeCents) => setForm({ ...form, incomeCents })}
          />
          <View className="gap-2">
            <Text variant="label">Vínculo</Text>
            {EMPLOYMENTS.map((employment) => {
              const selected = form.employmentType === employment;
              return (
                <Button
                  key={employment}
                  title={EMPLOYMENT_LABEL[employment]}
                  variant={selected ? 'primary' : 'secondary'}
                  onPress={() => setForm({ ...form, employmentType: employment })}
                  testID={`employment-${employment}`}
                />
              );
            })}
          </View>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="gap-4">
          <Text variant="title">Confira antes de enviar</Text>
          <Row label="Nome" value={form.fullName} />
          <Row label="CPF" value={form.cpf} />
          <Row label="E-mail" value={form.email} />
          <Row label="Renda mensal" value={brlFromCents(form.incomeCents)} />
          <Row label="Vínculo" value={EMPLOYMENT_LABEL[form.employmentType]} />
          <Row label="Margem consignável" value={brlFromCents(Math.round(form.incomeCents * 0.35))} />
        </Card>
      ) : null}

      <View className="mt-5 gap-3">
        {step < 2 ? (
          <Button title="Continuar" onPress={next} fullWidth testID="onboarding-continue" />
        ) : (
          <Button
            title="Enviar para análise"
            onPress={() => void submit()}
            loading={submitting}
            fullWidth
            testID="onboarding-submit"
          />
        )}
        {step > 0 ? (
          <Button
            title="Voltar"
            variant="ghost"
            onPress={() => setStep((current) => ((current - 1) as Step))}
            fullWidth
          />
        ) : null}
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 border-b border-line pb-2">
      <Text variant="caption">{label}</Text>
      <Text className="flex-shrink text-right text-[14px] font-semibold text-ink">{value}</Text>
    </View>
  );
}
