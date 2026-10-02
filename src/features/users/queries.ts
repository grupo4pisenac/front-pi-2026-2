import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, UserInput } from '@/types';
import { usersService } from '@/services/usersService';

export const userKeys = {
  all: ['users'] as const,
  list: ['users', 'list'] as const,
  stats: ['users', 'stats'] as const,
};

export const useUsers = () => useQuery({ queryKey: userKeys.list, queryFn: () => usersService.list() });
export const useUsersStats = () => useQuery({ queryKey: userKeys.stats, queryFn: () => usersService.stats() });

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: userKeys.all });
}

export function useSaveUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: UserInput }) =>
      id ? usersService.update(id, input) : usersService.create(input),
    onSuccess: invalidate,
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    // Remoção otimista: some da lista na hora; restaura se o backend recusar
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: userKeys.list });
      const previous = qc.getQueryData<User[]>(userKeys.list);
      qc.setQueryData<User[]>(userKeys.list, (old) => old?.filter((u) => u.id !== id));
      return { previous };
    },
    onError: (_err, _id, ctx) => ctx?.previous && qc.setQueryData(userKeys.list, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  });
}
