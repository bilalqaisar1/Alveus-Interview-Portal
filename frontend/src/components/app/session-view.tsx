'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useSessionContext, useSessionMessages } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { TileLayout } from '@/components/app/tile-layout';
import { useNavigate } from 'react-router-dom';
import {
  AgentControlBar,
  type ControlBarControls,
} from '@/components/livekit/agent-control-bar/agent-control-bar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';

const MotionBottom = motion.create('div');

const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut' as any,
  },
};


interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = React.forwardRef<HTMLDivElement, React.ComponentProps<'section'> & SessionViewProps>(
  ({ appConfig, ...props }, ref) => {
    const session = useSessionContext();
    const navigate = useNavigate();
    const { messages } = useSessionMessages(session);
    const [chatOpen, setChatOpen] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const controls: ControlBarControls = {
      leave: true,
      microphone: true,
      chat: appConfig.supportsChatInput,
      camera: appConfig.supportsVideoInput,
      screenShare: appConfig.supportsVideoInput,
    };

    useEffect(() => {
      const lastMessage = messages.at(-1);
      const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

      if (scrollAreaRef.current && lastMessageIsLocal) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    return (
      <section ref={ref} className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
        {/* Chat Transcript */}
        <div
          className={cn(
            'absolute inset-0 grid grid-cols-1 grid-rows-1',
            !chatOpen && 'pointer-events-none'
          )}
        >
          <Fade top className="absolute inset-x-4 top-0 h-40" />
          <ScrollArea ref={scrollAreaRef} className="px-4 pt-40 pb-[150px] md:px-6 md:pb-[200px]">
            <ChatTranscript
              hidden={!chatOpen}
              messages={messages}
              className="mx-auto max-w-2xl space-y-3 transition-opacity duration-300 ease-out"
            />
          </ScrollArea>
        </div>

        {/* Tile Layout */}
        <TileLayout chatOpen={chatOpen} />

        {/* Global End Call Button (Top Right Override for prominence) */}
        <div className="absolute top-4 right-4 z-[100] flex flex-col items-end gap-2">
          {/* Live indicator moved here for consolidation */}
          <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-gray-100 flex items-center gap-2 shadow-sm mb-1">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Live Session</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to end this interview?")) {
                session.end();
                navigate('/scheduled-interviews');
              }
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95 border-2 border-white/20"
          >
            END INTERVIEW
          </button>
        </div>

        {/* Bottom */}
        <MotionBottom
          {...BOTTOM_VIEW_MOTION_PROPS}
          className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
        >
          {appConfig.isPreConnectBufferEnabled && (
            <PreConnectMessage messages={messages} className="pb-4" />
          )}
          <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
            <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
            <AgentControlBar
              controls={controls}
              isConnected={session.isConnected}
              onDisconnect={session.end}
              onChatOpenChange={setChatOpen}
            />
          </div>
        </MotionBottom>
      </section>

    );
  }
);

