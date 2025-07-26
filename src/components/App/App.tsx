import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchNotes } from '../../services/noteService';
import { useDebouncedCallback } from 'use-debounce';
import NoteList from '../NoteList/NoteList';
import Pagination from '../Pagination/Pagination'; // Виправив назву імпорту
import SearchBox from '../SearchBox/SearchBox';
import Modal from '../Modal/Modal';
import NoteForm from '../NoteForm/NoteForm';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import css from '../App/App.module.css';

export default function App() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleSearch = useDebouncedCallback((search: string) => {
    setDebouncedSearch(search);
  }, 300);

  const handleSearchChange = (search: string) => {
    setSearch(search);
    setPage(1);
    handleSearch(search);
  };

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['notes', page, debouncedSearch],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search: debouncedSearch,
      }),
    placeholderData: keepPreviousData,
  });

  // Обчислюємо кількість сторінок на основі total кількості нотаток
  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <button className={css.button} type="button" onClick={() => setModalIsOpen(true)}>
          Create +
        </button>
      </header>
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {isSuccess && data?.data?.length > 0 ? (
        <NoteList notes={data.data} />
      ) : (
        <p>No notes found</p>
      )}
      {modalIsOpen && (
        <Modal onClose={() => setModalIsOpen(false)}>
          <NoteForm onClose={() => setModalIsOpen(false)} />
        </Modal>
      )}
    </div>
  );
}