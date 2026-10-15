import React, { useEffect, useState } from 'react';
import { api, Servico, StatusServico } from '../services/api';
import { Plus, Edit2, Trash2, Power, Briefcase, AlertCircle } from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface MeusServicosPageProps {
  abrirModalCriacaoInicial?: boolean;
}

export const MeusServicosPage: React.FC<MeusServicosPageProps> = ({ abrirModalCriacaoInicial = false }) => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalCriacaoAberto, setModalCriacaoAberto] = useState(abrirModalCriacaoInicial);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);

  // Formulário
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [categoria, setCategoria] = useState('Tecnologia e Programação');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarMeusServicos();
  }, []);

  const carregarMeusServicos = async () => {
    try {
      setCarregando(true);
      const res = await api.servicos.listarMeus();
      setServicos(res);
    } catch (err) {
      console.error('Erro ao listar meus serviços:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrirCriacao = () => {
    setServicoEmEdicao(null);
    setTitulo('');
    setTipo('');
    setCategoria('Tecnologia e Programação');
    setDescricao('');
    setErro(null);
    setModalCriacaoAberto(true);
  };

  const handleAbrirEdicao = (s: Servico) => {
    setServicoEmEdicao(s);
    setTitulo(s.titulo);
    setTipo(s.tipo);
    setCategoria(s.categoria);
    setDescricao(s.descricao);
    setErro(null);
    setModalCriacaoAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      if (servicoEmEdicao) {
        await api.servicos.atualizar(servicoEmEdicao.id, {
          titulo,
          tipo,
          categoria,
          descricao,
          status: servicoEmEdicao.status,
        });
      } else {
        await api.servicos.criar({
          titulo,
          tipo,
          categoria,
          descricao,
        });
      }
      setModalCriacaoAberto(false);
      await carregarMeusServicos();
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar serviço.');
    } finally {
      setSalvando(false);
    }
  };

  const handleAlternarStatus = async (id: string) => {
    try {
      await api.servicos.alternarStatus(id);
      await carregarMeusServicos();
    } catch (err) {
      console.error('Erro ao alternar status do serviço:', err);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja remover este serviço do catálogo?')) return;
    try {
      await api.servicos.excluir(id);
      await carregarMeusServicos();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir serviço.');
    }
  };

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando seus serviços cadastrados..." />;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Minhas Habilidades Publicadas
          </span>
          <h2>Gerenciar Meus Serviços</h2>
          <p>Mantenha suas competências atualizadas para atrair matches compatíveis na comunidade.</p>
        </div>

        <button onClick={handleAbrirCriacao} className="btn btn-primary">
          <Plus size={16} /> Publicar Novo Serviço
        </button>
      </div>

      {servicos.length === 0 ? (
        <EmptyState 
          icon={Briefcase}
          titulo="Você ainda não publicou nenhuma habilidade"
          descricao="Para que outros membros encontrem seu perfil e o algoritmo gere matches recíprocos, você precisa cadastrar pelo menos um serviço que domina."
          acaoLabel="Cadastrar Minha Primeira Habilidade"
          onAcao={handleAbrirCriacao}
        />
      ) : (
        <div className="grid-cols-2">
          {servicos.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-primary">{s.categoria}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge status={s.status} />
                    <button 
                      onClick={() => handleAlternarStatus(s.id)}
                      className="btn btn-ghost btn-sm"
                      title={s.status === 'DISPONIVEL' ? 'Pausar serviço (tornar indisponível)' : 'Ativar serviço'}
                      style={{ padding: '0.35rem', color: s.status === 'DISPONIVEL' ? 'var(--color-warning)' : 'var(--color-success)' }}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{s.titulo}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '1rem' }}>
                  Tipo normalizado: #{s.tipo}
                </span>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {s.descricao}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => handleAbrirEdicao(s)} className="btn btn-secondary btn-sm">
                  <Edit2 size={14} /> Editar
                </button>
                <button onClick={() => handleExcluir(s.id)} className="btn btn-danger btn-sm">
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalCriacaoAberto && (
        <div className="modal-overlay" onClick={() => setModalCriacaoAberto(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{servicoEmEdicao ? 'Editar Habilidade' : 'Publicar Nova Habilidade'}</h3>
              <button onClick={() => setModalCriacaoAberto(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="modal-body">
                {erro && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-subtle)',
                    border: '1px solid var(--color-danger)',
                    color: '#fca5a5',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{erro}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="srv-titulo">Título da Habilidade / Oferta</label>
                  <input 
                    id="srv-titulo"
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: Consultoria em Arquitetura de Software"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="srv-tipo">Tipo Chave (Tag de Match)</label>
                    <input 
                      id="srv-tipo"
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: programacao, design, ingles"
                      value={tipo}
                      onChange={e => setTipo(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Palavra-chave cruzada com os interesses de outros usuários.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="srv-categoria">Categoria</label>
                    <select 
                      id="srv-categoria"
                      className="form-select"
                      value={categoria}
                      onChange={e => setCategoria(e.target.value)}
                    >
                      <option value="Tecnologia e Programação">Tecnologia e Programação</option>
                      <option value="Design e Criatividade">Design e Criatividade</option>
                      <option value="Educação e Idiomas">Educação e Idiomas</option>
                      <option value="Negócios e Marketing">Negócios e Marketing</option>
                      <option value="Audiovisual e Fotografia">Audiovisual e Fotografia</option>
                      <option value="Consultoria e Mentoria">Consultoria e Mentoria</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="srv-desc">Descrição Detalhada do que será entregue</label>
                  <textarea 
                    id="srv-desc"
                    className="form-textarea" 
                    rows={4}
                    placeholder="Especifique com precisão o que está incluso no seu serviço, horas estimadas de dedicação e entregáveis..."
                    value={descricao}
                    onChange={e => setDescricao(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalCriacaoAberto(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : (servicoEmEdicao ? 'Salvar Alterações' : 'Publicar Serviço')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
