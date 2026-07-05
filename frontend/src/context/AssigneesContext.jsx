import { createContext, useContext, useEffect, useState } from "react";
import { listAssignees, updateAssigneeLabel } from "../api/assignees";
import { ASSIGNEES as DEFAULT_ASSIGNEES } from "../constants";

const AssigneesContext = createContext(null);

export function AssigneesProvider({ children }) {
  const [assignees, setAssignees] = useState(
    DEFAULT_ASSIGNEES.map((a) => ({ key: a.value, label: a.label }))
  );

  function reload() {
    listAssignees().then((list) => {
      if (list.length > 0) setAssignees(list);
    });
  }

  useEffect(reload, []);

  async function rename(key, label) {
    const updated = await updateAssigneeLabel(key, label);
    setAssignees((prev) => prev.map((a) => (a.key === key ? updated : a)));
  }

  function labelFor(key) {
    return assignees.find((a) => a.key === key)?.label || key;
  }

  return (
    <AssigneesContext.Provider value={{ assignees, labelFor, rename, reload }}>
      {children}
    </AssigneesContext.Provider>
  );
}

export function useAssignees() {
  return useContext(AssigneesContext);
}
