'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/livekit/toaster';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = import.meta.env.DEV;

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
}

export function App({ appConfig }: AppProps) {
  const tokenSource = useMemo(() => {
    if (typeof import.meta.env.VITE_NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string') {
      return getSandboxTokenSource(appConfig);
    }

    return TokenSource.custom(async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
      const response = await fetch(`${backendUrl}/api/connection-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: appConfig.interviewId,
          room_config: appConfig.agentName ? { agents: [{ agent_name: appConfig.agentName }] } : undefined
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch connection details');
      }
      return response.json();
    });
  }, [appConfig]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="grid h-full grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
