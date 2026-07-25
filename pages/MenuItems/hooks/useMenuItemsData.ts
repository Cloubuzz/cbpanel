import { useState, useEffect, useCallback } from 'react';
import { fetchMenuItems, fetchToppingTemplates } from '../../../services/menuItemsApi';
import { fetchCategories, type ApiCategory } from '../../../services/categoriesApi';
import type { MenuItem, ModifierGroup } from '../types';
import { PAGE_SIZE } from '../constants';
import { mapApiMenuItem } from '../utils';

export function useMenuItemsData(token: string | null) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterOnlyActive, setFilterOnlyActive] = useState<boolean | undefined>(true);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);

  const loadItems = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchMenuItems(token, {
        page: currentPage,
        pageSize: PAGE_SIZE,
        onlyActive: filterOnlyActive,
        categoryId: filterCategoryId,
      });
      setItems(data.map(mapApiMenuItem));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load menu items.');
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, filterOnlyActive, filterCategoryId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const loadCategoriesData = async () => {
      if (!token) return;
      try {
        const fetchedCategories = await fetchCategories(token, true);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load active categories:', error);
      }
    };
    loadCategoriesData();
  }, [token]);

  useEffect(() => {
    const loadModifierGroups = async () => {
      if (!token) return;
      try {
        const templates = await fetchToppingTemplates(token);
        const seen = new Set<string>();
        const mappedGroups: ModifierGroup[] = [];

        templates.forEach((template) => {
          const rawName = (template.Name || (template as any).name || '').trim();
          if (!rawName) return;
          const key = rawName.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            mappedGroups.push({
              id: rawName,
              name: rawName,
              minSelection: 0,
              maxSelection: 99,
            });
          }
        });
        setModifierGroups(mappedGroups);
      } catch (error) {
        console.error('Failed to load topping templates:', error);
        setModifierGroups([]);
      }
    };
    loadModifierGroups();
  }, [token]);

  return {
    items,
    categories,
    isLoading,
    loadError,
    filterOnlyActive,
    setFilterOnlyActive,
    filterCategoryId,
    setFilterCategoryId,
    currentPage,
    setCurrentPage,
    modifierGroups,
    loadItems,
  };
}
