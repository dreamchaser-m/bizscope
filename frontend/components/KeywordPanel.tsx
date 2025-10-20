'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Trash2, Edit2, Plus, Save } from 'lucide-react';
import { keywordsApi } from '@/lib/api';
import { useStore } from '../lib/store';
import type { Keyword } from '../lib/store';

export default function KeywordPanel() {
  const { keywords, setKeywords, status } = useStore();
  const [localKeywords, setLocalKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const isBusy = status.status === 'busy';

  useEffect(() => {
    loadKeywords();
  }, []);

  useEffect(() => {
    setLocalKeywords(keywords);
  }, [keywords]);

  const loadKeywords = async () => {
    try {
      const data = await keywordsApi.getAll();
      setKeywords(data);
    } catch (error) {
      console.error('Failed to load keywords:', error);
    }
  };

  const handleAdd = () => {
    if (!newKeyword.trim()) return;
    
    const tempKeyword: Keyword = {
      id: Date.now(),
      keyword: newKeyword.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setLocalKeywords([...localKeywords, tempKeyword]);
    setNewKeyword('');
    setHasChanges(true);
  };

  const handleEdit = (id: number, keyword: string) => {
    setEditingId(id);
    setEditValue(keyword);
  };

  const handleSaveEdit = (id: number) => {
    if (!editValue.trim()) return;
    
    setLocalKeywords(
      localKeywords.map((k) =>
        k.id === id ? { ...k, keyword: editValue.trim() } : k
      )
    );
    setEditingId(null);
    setEditValue('');
    setHasChanges(true);
  };

  const handleDelete = (id: number) => {
    setLocalKeywords(localKeywords.filter((k) => k.id !== id));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    if (isBusy) return;
    
    setLoading(true);
    try {
      // Delete removed keywords
      const removedKeywords = keywords.filter(
        (k) => !localKeywords.find((lk) => lk.id === k.id)
      );
      for (const k of removedKeywords) {
        await keywordsApi.delete(k.id);
      }

      // Update existing keywords
      const updatedKeywords = localKeywords.filter((lk) =>
        keywords.find((k) => k.id === lk.id && k.keyword !== lk.keyword)
      );
      for (const k of updatedKeywords) {
        await keywordsApi.update(k.id, k.keyword);
      }

      // Create new keywords
      const newKeywords = localKeywords.filter(
        (lk) => !keywords.find((k) => k.id === lk.id)
      );
      for (const k of newKeywords) {
        await keywordsApi.create(k.keyword);
      }

      await loadKeywords();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save keywords:', error);
      alert('Failed to save keywords. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">Saved Keywords</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter keyword..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          disabled={isBusy}
        />
        <Button onClick={handleAdd} disabled={isBusy} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto space-y-2 mb-4">
        {localKeywords.map((keyword) => (
          <div
            key={keyword.id}
            className="flex items-center gap-2 p-2 border rounded hover:bg-accent"
          >
            {editingId === keyword.id ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleSaveEdit(keyword.id)
                  }
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={() => handleSaveEdit(keyword.id)}
                  size="sm"
                  variant="default"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1">{keyword.keyword}</span>
                <Button
                  onClick={() => handleEdit(keyword.id, keyword.keyword)}
                  size="icon"
                  variant="ghost"
                  disabled={isBusy}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(keyword.id)}
                  size="icon"
                  variant="ghost"
                  disabled={isBusy}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleSaveAll}
        disabled={!hasChanges || isBusy || loading}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>

      {isBusy && status.progress && (
        <div className="mt-4 text-sm text-muted-foreground">
          Updating: {status.progress.keywords_done} / {status.progress.total_keywords}
        </div>
      )}
    </Card>
  );
}
