import { useEffect } from 'react';

export function usePersistentForm(formId: string) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    // Restore from localStorage
    const saved = localStorage.getItem(`draft_${formId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.entries(data).forEach(([key, value]) => {
          const el = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value")?.set;
            const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

            if (el.tagName === 'INPUT' && nativeInputValueSetter) {
              nativeInputValueSetter.call(el, value as string);
            } else if (el.tagName === 'SELECT' && nativeSelectValueSetter) {
              nativeSelectValueSetter.call(el, value as string);
            } else if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
              nativeTextAreaValueSetter.call(el, value as string);
            } else {
               el.value = value as string;
            }
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      } catch (e) {
        console.error('Failed to restore form data', e);
      }
    }

    // Save on input
    const handleChange = () => {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      localStorage.setItem(`draft_${formId}`, JSON.stringify(data));
    };

    // Use setTimeout so the listeners are added after React hydration,
    // and wait for initial renders.
    const timer = setTimeout(() => {
      form.addEventListener('input', handleChange);
      form.addEventListener('change', handleChange);
    }, 500);

    return () => {
      clearTimeout(timer);
      form.removeEventListener('input', handleChange);
      form.removeEventListener('change', handleChange);
    };
  }, [formId]);
}
