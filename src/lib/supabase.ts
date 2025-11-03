import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para o banco de dados
export interface Conversation {
  id: string;
  client_email?: string;
  client_name?: string;
  initial_prompt: string;
  project_type: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  message_type: 'text' | 'image' | 'options';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ProjectData {
  id: string;
  conversation_id: string;
  company_name?: string; // ✅ Nome da empresa (separado de business_type)
  business_type?: string; // ✅ Setor/Negócio (Barbearia, Restaurante, etc.)
  business_objective?: string;
  target_audience?: string;
  pages_needed?: string[];
  design_style?: string;
  design_colors?: string[];
  functionalities?: string[];
  content_needs?: Record<string, unknown>;
  estimated_cost?: string;
  estimated_time?: string;
  generated_images?: string[];
  final_summary?: string;
  // ✅ Colunas adicionais para sistema iterativo (existem no banco)
  logo_url?: string;
  logo_analysis?: string | Record<string, unknown>;
  has_logo?: boolean;
  // ✅ Campos avançados (formulário)
  use_logo_colors?: boolean;
  font_style?: string;
  cta_text?: string;
  animation_level?: string;
  avoid_styles?: string;
  has_ai_generated_text?: boolean;
  slogan?: string;
  short_description?: string;
  site_structure?: string; // 'single_page' ou 'multiple_pages'
  current_site_code?: string;
  site_version?: number;
  modification_history?: Array<Record<string, unknown>>;
  preview_url?: string;
  // ✅ Artefatos do pipeline modular
  structure_json?: Record<string, unknown>;
  visual_identity_json?: Record<string, unknown>;
  interactivity_settings?: Record<string, unknown>;
  final_code?: string;
  hubspot_contact_id?: string;
  hubspot_deal_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  conversation_id: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  lead_source: string;
  lead_quality: 'hot' | 'warm' | 'cold';
  assigned_to?: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  notes?: string;
  created_at: string;
}

export interface SiteVersion {
  id: string;
  conversation_id: string;
  version_number: number;
  site_code: string;
  modification_description?: string;
  site_code_id?: string; // ✅ ID protegido do código
  created_at: string;
}

export interface FileUpload {
  id: string;
  conversation_id: string;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  analysis_result?: Record<string, unknown> | string;
  created_at: string;
}

// Funções utilitárias para o banco
export class DatabaseService {
  // Conversações
  static async createConversation(data: Partial<Conversation>): Promise<Conversation> {
    // Se um id foi fornecido, tornar a operação idempotente com upsert e tratar 23505
    if (data.id) {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .upsert(data, { onConflict: 'id', ignoreDuplicates: false })
        .select()
        .single();

      if (error) {
        // Duplicidade por corrida: retornar conversa existente
        // @ts-expect-error: código do erro pode existir em runtime
        if (error.code === '23505') {
          const existing = await this.getConversation(String(data.id));
          if (existing) return existing;
        }
        throw error;
      }
      return conversation as Conversation;
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return conversation as Conversation;
  }

  static async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  static async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  // Mensagens
  static async addMessage(data: Partial<Message>): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return message;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Dados do projeto
  static async updateProjectData(conversationId: string, data: Partial<ProjectData>): Promise<void> {
    // Upsert idempotente baseado em UNIQUE(conversation_id)
    const { error } = await supabase
      .from('project_data')
      .upsert(
        {
          conversation_id: conversationId,
          ...data,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'conversation_id', ignoreDuplicates: false }
      );

    if (error) {
      // @ts-expect-error: code disponível em runtime
      if (error.code === '23505') {
        // Conflito por corrida: realizar update direto
        const { error: updError } = await supabase
          .from('project_data')
          .update({ ...data })
          .eq('conversation_id', conversationId);
        if (updError) throw updError;
        return;
      }
      throw error;
    }
  }

  static async getProjectData(conversationId: string): Promise<ProjectData | null> {
    const { data, error } = await supabase
      .from('project_data')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();
    
    if (error) return null;
    return data;
  }

  // Leads
  static async createLead(data: Partial<Lead>): Promise<Lead> {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return lead;
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  }

  // ✅ Site Versions - FUNÇÕES FALTANTES
  static async addSiteVersion(data: Partial<SiteVersion>): Promise<SiteVersion> {
    console.log('💾 [DatabaseService.addSiteVersion] Salvando versão...');
    console.log('💾 [DatabaseService.addSiteVersion] conversation_id:', data.conversation_id);
    console.log('💾 [DatabaseService.addSiteVersion] version_number:', data.version_number);
    console.log('💾 [DatabaseService.addSiteVersion] site_code length:', data.site_code?.length || 0);
    console.log('💾 [DatabaseService.addSiteVersion] site_code_id:', data.site_code_id);
    
    const { data: siteVersion, error } = await supabase
      .from('site_versions')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [DatabaseService.addSiteVersion] Erro:', error);
      throw error;
    }
    
    console.log('✅ [DatabaseService.addSiteVersion] Versão salva com ID:', siteVersion.id);
    console.log('✅ [DatabaseService.addSiteVersion] site_code salvo length:', siteVersion.site_code?.length || 0);
    
    return siteVersion;
  }

  static async getSiteVersions(conversationId: string): Promise<SiteVersion[]> {
    const { data, error } = await supabase
      .from('site_versions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('version_number', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar versões do site:', error);
      return [];
    }
    return data;
  }

  static async getLatestSiteVersion(conversationId: string): Promise<SiteVersion | null> {
    const { data, error } = await supabase
      .from('site_versions')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();
    
    if (error) return null;
    return data;
  }

  // ✅ File Uploads - FUNÇÕES FALTANTES
  static async addFileUpload(data: Partial<FileUpload>): Promise<FileUpload> {
    const { data: fileUpload, error } = await supabase
      .from('file_uploads')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return fileUpload;
  }

  static async getFileUploads(conversationId: string): Promise<FileUpload[]> {
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar uploads:', error);
      return [];
    }
    return data;
  }

  // ✅ Funções auxiliares para o projeto
  static async createProjectDataIfNotExists(conversationId: string, data: Partial<ProjectData>): Promise<ProjectData> {
    // Operação idempotente com upsert por conversation_id
    const { data: projectData, error } = await supabase
      .from('project_data')
      .upsert(
        {
          conversation_id: conversationId,
          ...data,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'conversation_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (!error) return projectData as ProjectData;

    // @ts-expect-error: code disponível em runtime
    if (error.code === '23505') {
      // Registro já existe por corrida: buscar e atualizar
      const existing = await this.getProjectData(conversationId);
      if (existing) {
        await this.updateProjectData(conversationId, data);
        return (await this.getProjectData(conversationId)) as ProjectData;
      }
    }
    throw error;
  }

  // ✅ Função para buscar dados completos de uma conversa
  static async getConversationData(conversationId: string) {
    const [conversation, messages, projectData, siteVersions, fileUploads] = await Promise.all([
      this.getConversation(conversationId),
      this.getMessages(conversationId),
      this.getProjectData(conversationId),
      this.getSiteVersions(conversationId),
      this.getFileUploads(conversationId)
    ]);

    return {
      conversation,
      messages,
      projectData,
      siteVersions,
      fileUploads
    };
  }

  // ✅ Acesso direto ao cliente Supabase para casos especiais
  static get supabase() {
    return supabase;
  }
}
