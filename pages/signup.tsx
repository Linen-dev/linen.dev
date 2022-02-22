import React, { useState } from 'react';
import { useForm } from '@mantine/hooks';
// import { EnvelopeClosedIcon, LockClosedIcon } from '@modulz/radix-icons';
import {
  TextInput,
  PasswordInput,
  Group,
  Checkbox,
  Button,
  Paper,
  Text,
  LoadingOverlay,
  Anchor,
  useMantineTheme,
} from '@mantine/core';

export interface AuthenticationFormProps {
  noShadow?: boolean;
  noPadding?: boolean;
  noSubmit?: boolean;
  style?: React.CSSProperties;
}

export default function AuthenticationForm({
  noShadow,
  noPadding,
  noSubmit,
  style,
}: AuthenticationFormProps) {
  const [formType, setFormType] = useState<'register' | 'login'>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(null);
  const theme = useMantineTheme();

  const toggleFormType = () => {
    setFormType((current) => (current === 'register' ? 'login' : 'register'));
    setError(null);
  };
  const redirectDomain = 'linen.papercups.io';
  const redirectUri = 'https://linen.dev/api/oauth';
  const url =
    'https://slack.com/oauth/v2/' +
    'authorize?client_id=1250901093238.3006399856353&' +
    'scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
    '&user_scope=channels:history' +
    '&state=' +
    redirectDomain +
    '&redirect_uri=' +
    redirectUri;

  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsOfService: true,
    },

    validationRules: {
      firstName: (value) => formType === 'login' || value.trim().length >= 2,
      lastName: (value) => formType === 'login' || value.trim().length >= 2,
      email: (value) => /^\S+@\S+$/.test(value),
      password: (value) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(value),
      confirmPassword: (val, values) =>
        formType === 'login' || val === values.password,
    },

    errorMessages: {
      email: 'Invalid email',
      password:
        'Password should contain 1 number, 1 letter and at least 6 characters',
      confirmPassword: "Passwords don't match. Try again",
    },
  });

  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setError(
        formType === 'register'
          ? 'User with this email already exists'
          : 'User with this email does not exist'
      );
    }, 3000);
  };

  return (
    <div
      style={{
        // minWidth: '1044px',
        // flex: '1 0 auto',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        padding={noPadding ? 0 : 'lg'}
        shadow={noShadow ? null : 'sm'}
        style={{
          position: 'relative',
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          ...style,
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={loading} />
          <TextInput
            required
            label="Redirect domain"
            placeholder="discuss.airbyte.com"
            mb="md"
            {...form.getInputProps('email')}
          />
          <a href={url} style={{ marginTop: 10 }}>
            <img
              alt="Add to Slack"
              height="40"
              width="139"
              src="https://platform.slack-edge.com/img/add_to_slack.png"
              srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
            />
          </a>
        </form>
      </Paper>
    </div>
  );
}
