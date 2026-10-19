/* eslint-disable react-refresh/only-export-components */
import { useState, type FC, type ReactNode } from 'react';
import {
  BookOpen,
  Layers,
  Globe,
  Code2,
  Database,
  Terminal,
  Shield,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import {
  NextJsIcon,
  TanStackIcon,
  ReactIcon,
  TypeScriptIcon,
  TailwindIcon,
  ShadcnIcon,
  ViteIcon,
  BunIcon,
  SupabaseIcon,
  VercelIcon,
  MdnIcon,
  ZodIcon,
  LucideIcon,
  WebSocketIcon,
  XenditIcon,
  ZendeskIcon,
  StackOverflowIcon,
  GitHubIcon,
  PrismaIcon,
  DockerIcon,
  CiCdIcon,
  CloudflareIcon,
  RedisIcon,
  TanStackStartIcon,
  PostgreSqlIcon,
  ClerkIcon,
  MongoDbIcon,
  MySqlIcon,
  HonoIcon,
  ExpressIcon,
  WorkOsIcon,
  RestApiIcon,
  TrpcIcon,
  GrpcIcon,
  GraphQlIcon,
  AuroraScharffIcon,
  LydiaHallieIcon,
  MasterDevIcon,
  NodeJsIcon,
  OpenAiIcon,
  AnthropicIcon,
  LangChainIcon,
  HuggingFaceIcon,
  OllamaIcon,
  VectorDbIcon,
  NeuralNetworkIcon,
  LlamaIndexIcon,
  KarpathyIcon,
  AxiosIcon,
  GitIcon,
  LinqIcon,
} from './resource_icons';

export interface EducatorAvatarProps {
  src: string;
  alt: string;
  fallback: ReactNode;
  width?: number;
  height?: number;
}

export const EducatorAvatar: FC<EducatorAvatarProps> = ({
  src,
  alt,
  fallback,
  width = 24,
  height = 24,
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className="resources-avatar-img"
    />
  );
};

const EDUCATOR_AVATARS: Record<string, string> = {
  aurora: 'https://github.com/aurorascharff.png',
  'aurora-scharff': 'https://github.com/aurorascharff.png',
  'aurora scharff': 'https://github.com/aurorascharff.png',
  lydia: 'https://github.com/lydiahallie.png',
  'lydia-hallie': 'https://github.com/lydiahallie.png',
  'lydia hallie': 'https://github.com/lydiahallie.png',
  simon: 'https://github.com/simonw.png',
  'simon-willison': 'https://github.com/simonw.png',
  'simon willison': 'https://github.com/simonw.png',
  theobrowne: 'https://github.com/theobrowne.png',
  'theo-browne': 'https://github.com/theobrowne.png',
  'theo browne': 'https://github.com/theobrowne.png',
  karpathy: 'https://github.com/karpathy.png',
  'andrej-karpathy': 'https://github.com/karpathy.png',
  'andrej karpathy': 'https://github.com/karpathy.png',
  'kent-c-dodds': 'https://github.com/kentcdodds.png',
  'kent c. dodds': 'https://github.com/kentcdodds.png',
  'dan-abramov': 'https://github.com/gaearon.png',
  'dan abramov': 'https://github.com/gaearon.png',
  'lee-robinson': 'https://github.com/leerob.png',
  'lee robinson': 'https://github.com/leerob.png',
  callstack: 'https://github.com/callstack.png',
  'callstackengineers': 'https://github.com/callstack.png',
  'callstack engineers': 'https://github.com/callstack.png',
  'callstack-engineers': 'https://github.com/callstack.png',
  linq: 'https://github.com/thelinqapp.png',
  thelinqapp: 'https://github.com/thelinqapp.png',
  'linq app': 'https://github.com/thelinqapp.png',
  'the linq app': 'https://github.com/thelinqapp.png',
};

/**
 * Dynamically resolves an SVG icon component or profile picture avatar for any resource item,
 * matching by iconName, id, name, githubUrl, or category keywords, with resilient fallbacks.
 */
export function resolveResourceIcon(
  item: { id?: string; name?: string; iconName?: string; category?: string; githubUrl?: string },
  width = 18,
  height = 18,
): ReactNode {
  const token = `${item.iconName ?? ''} ${item.id ?? ''} ${item.name ?? ''}`.toLowerCase();

  // 1. Direct Educator & Personality Profile Pictures
  for (const [key, avatarUrl] of Object.entries(EDUCATOR_AVATARS)) {
    if (token.includes(key)) {
      const fallbackIcon =
        token.includes('aurora') ? (
          <AuroraScharffIcon width={width} height={height} />
        ) : token.includes('lydia') ? (
          <LydiaHallieIcon width={width} height={height} />
        ) : token.includes('karpathy') ? (
          <KarpathyIcon width={width} height={height} />
        ) : token.includes('linq') || token.includes('thelinqapp') ? (
          <LinqIcon width={width} height={height} />
        ) : (
          <PlayCircle size={width} />
        );

      return (
        <EducatorAvatar
          src={avatarUrl}
          alt={item.name ?? 'Educator'}
          fallback={fallbackIcon}
          width={width}
          height={height}
        />
      );
    }
  }

  // 2. Video & Masterclasses with GitHub creator profile
  const cat = (item.category ?? '').toLowerCase();
  if (
    cat.includes('masterclass') ||
    cat.includes('video') ||
    cat.includes('educator') ||
    cat.includes('personality')
  ) {
    if (item.githubUrl) {
      const match = item.githubUrl.match(/github\.com\/([a-zA-Z0-9_-]+)\/?$/);
      if (match && match[1]) {
        const username = match[1];
        return (
          <EducatorAvatar
            src={`https://github.com/${username}.png`}
            alt={item.name ?? 'Educator'}
            fallback={<PlayCircle size={width} />}
            width={width}
            height={height}
          />
        );
      }
    }
  }

  // AI & LLM Specific Tools
  if (token.includes('openai') || token.includes('chatgpt') || token.includes('gpt')) return <OpenAiIcon width={width} height={height} />;
  if (token.includes('anthropic') || token.includes('claude')) return <AnthropicIcon width={width} height={height} />;
  if (token.includes('langchain') || token.includes('langgraph')) return <LangChainIcon width={width} height={height} />;
  if (token.includes('llamaindex') || token.includes('llama-index')) return <LlamaIndexIcon width={width} height={height} />;
  if (token.includes('huggingface') || token.includes('hugging-face') || token.includes('transformers')) return <HuggingFaceIcon width={width} height={height} />;
  if (token.includes('ollama')) return <OllamaIcon width={width} height={height} />;
  if (token.includes('chroma') || token.includes('pinecone') || token.includes('vector') || token.includes('pgvector')) return <VectorDbIcon width={width} height={height} />;
  if (token.includes('karpathy')) return <KarpathyIcon width={width} height={height} />;
  if (token.includes('neural') || token.includes('deeplearning') || token.includes('model')) return <NeuralNetworkIcon width={width} height={height} />;

  // Frameworks & Web Tools
  if (token.includes('tanstack-start')) return <TanStackStartIcon width={width} height={height} />;
  if (token.includes('tanstack') || token.includes('react-query')) return <TanStackIcon width={width} height={height} />;
  if (token.includes('next')) return <NextJsIcon width={width} height={height} />;
  if (token.includes('react')) return <ReactIcon width={width} height={height} />;
  if (token.includes('typescript') || token.includes('ts')) return <TypeScriptIcon width={width} height={height} />;
  if (token.includes('tailwind')) return <TailwindIcon width={width} height={height} />;
  if (token.includes('shadcn')) return <ShadcnIcon width={width} height={height} />;
  if (token.includes('axios')) return <AxiosIcon width={width} height={height} />;
  if (token.includes('git') && !token.includes('github')) return <GitIcon width={width} height={height} />;
  if (token.includes('github')) return <GitHubIcon width={width} height={height} />;
  if (token.includes('vite')) return <ViteIcon width={width} height={height} />;
  if (token.includes('bun')) return <BunIcon width={width} height={height} />;
  if (token.includes('supabase')) return <SupabaseIcon width={width} height={height} />;
  if (token.includes('vercel')) return <VercelIcon width={width} height={height} />;
  if (token.includes('docker')) return <DockerIcon width={width} height={height} />;
  if (token.includes('cicd') || token.includes('ci/cd') || token.includes('pipeline')) return <CiCdIcon width={width} height={height} />;
  if (token.includes('cloudflare')) return <CloudflareIcon width={width} height={height} />;
  if (token.includes('redis')) return <RedisIcon width={width} height={height} />;
  if (token.includes('postgres')) return <PostgreSqlIcon width={width} height={height} />;
  if (token.includes('mysql')) return <MySqlIcon width={width} height={height} />;
  if (token.includes('mongo')) return <MongoDbIcon width={width} height={height} />;
  if (token.includes('prisma')) return <PrismaIcon width={width} height={height} />;
  if (token.includes('hono')) return <HonoIcon width={width} height={height} />;
  if (token.includes('express')) return <ExpressIcon width={width} height={height} />;
  if (token.includes('node')) return <NodeJsIcon width={width} height={height} />;
  if (token.includes('websocket') || token.includes('socket')) return <WebSocketIcon width={width} height={height} />;
  if (token.includes('clerk')) return <ClerkIcon width={width} height={height} />;
  if (token.includes('workos')) return <WorkOsIcon width={width} height={height} />;
  if (token.includes('xendit')) return <XenditIcon width={width} height={height} />;
  if (token.includes('zendesk')) return <ZendeskIcon width={width} height={height} />;
  if (token.includes('rest')) return <RestApiIcon width={width} height={height} />;
  if (token.includes('trpc')) return <TrpcIcon width={width} height={height} />;
  if (token.includes('grpc')) return <GrpcIcon width={width} height={height} />;
  if (token.includes('graphql')) return <GraphQlIcon width={width} height={height} />;
  if (token.includes('zod')) return <ZodIcon width={width} height={height} />;
  if (token.includes('lucide')) return <LucideIcon width={width} height={height} />;
  if (token.includes('mdn') || token.includes('mozilla')) return <MdnIcon width={width} height={height} />;
  if (token.includes('stackoverflow') || token.includes('stack-overflow')) return <StackOverflowIcon width={width} height={height} />;
  if (token.includes('mastering') || token.includes('master-dev')) return <MasterDevIcon width={width} height={height} />;
  if (token.includes('linq') || token.includes('thelinqapp')) return <LinqIcon width={width} height={height} />;

  // Category-based fallback iconography
  if (cat.includes('ai') || cat.includes('llm') || cat.includes('ml')) return <Sparkles size={width} />;
  if (cat.includes('database')) return <Database size={width} />;
  if (cat.includes('devops') || cat.includes('backend') || cat.includes('api')) return <Terminal size={width} />;
  if (cat.includes('auth') || cat.includes('security')) return <Shield size={width} />;
  if (cat.includes('video') || cat.includes('masterclass')) return <PlayCircle size={width} />;
  if (cat.includes('styling') || cat.includes('ui')) return <Layers size={width} />;
  if (cat.includes('doc') || cat.includes('standard')) return <BookOpen size={width} />;
  if (cat.includes('framework')) return <Code2 size={width} />;

  return <Globe size={width} />;
}

