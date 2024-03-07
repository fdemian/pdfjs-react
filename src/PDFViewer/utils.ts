const findText = ({pdfDocument, text}) => {
  let _dirtyMatch = shouldDirtyMatch(state);
  //if(should)
}


/*
#onFind(state) {
    if (!state) {
      return;
    }
    const { type } = state;

    if (this.#state === null || this.#shouldDirtyMatch(state)) {
      this._dirtyMatch = true;
    }
    this.#state = state;
    if (type !== "highlightallchange") {
      this.#updateUIState(FindState.PENDING);
    }

    this._firstPageCapability.promise.then(() => {
      // If the document was closed before searching began, or if the search
      // operation was relevant for a previously opened document, do nothing.
      if (
        !this._pdfDocument ||
        (pdfDocument && this._pdfDocument !== pdfDocument)
      ) {
        return;
      }
      this.#extractText();

      const findbarClosed = !this._highlightMatches;
      const pendingTimeout = !!this._findTimeout;

      if (this._findTimeout) {
        clearTimeout(this._findTimeout);
        this._findTimeout = null;
      }
      if (!type) {
        // Trigger the find action with a small delay to avoid starting the
        // search when the user is still typing (saving resources).
        this._findTimeout = setTimeout(() => {
          this.#nextMatch();
          this._findTimeout = null;
        }, FIND_TIMEOUT);
      } else if (this._dirtyMatch) {
        // Immediately trigger searching for non-'find' operations, when the
        // current state needs to be reset and matches re-calculated.
        this.#nextMatch();
      } else if (type === "again") {
        this.#nextMatch();

        // When the findbar was previously closed, and `highlightAll` is set,
        // ensure that the matches on all active pages are highlighted again.
        if (findbarClosed && this.#state.highlightAll) {
          this.#updateAllPages();
        }
      } else if (type === "highlightallchange") {
        // If there was a pending search operation, synchronously trigger a new
        // search *first* to ensure that the correct matches are highlighted.
        if (pendingTimeout) {
          this.#nextMatch();
        } else {
          this._highlightMatches = true;
        }
        this.#updateAllPages(); // Update the highlighting on all active pages.
      } else {
        this.#nextMatch();
      }
    });
  }
  */