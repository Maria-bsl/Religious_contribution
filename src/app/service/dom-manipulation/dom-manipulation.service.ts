import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
// import { MElementPair } from '../../core/types/login-form-fields';
import {
  BehaviorSubject,
  filter,
  from,
  map,
  merge,
  Observable,
  of,
  OperatorFunction,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { AppUtilities } from '../../utils/app-utilities';
import { HtmlSelectOption } from '../../models/html-select-option';

export type MElementPair = Map<number, Element | null>;

export const filterNotNull =
  <T>(): OperatorFunction<T, Exclude<T, null | undefined>> =>
  (source$) =>
    source$.pipe(
      filter((value) => value !== null && value !== undefined)
    ) as Observable<Exclude<T, null | undefined>>;

type TControls =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | NodeListOf<HTMLInputElement>;

export type THtmlElementControls = [Observable<TControls>, FormControl<any>];

export type TCheckboxLabel = [HTMLInputElement, HTMLLabelElement];

@Injectable({
  providedIn: 'root',
})
export class DomManipulationService {
  constructor(private unsubscribe: UnsubscribeService) {}
  private getCSVFromString(csvString: string, LENGTH: number) {
    return (() => {
      try {
        if (!csvString) {
          throw Error('Unexpected: Document ids are empty.');
        }
        const regex = /^([^,\n\r"]+|"[^"]*")(,([^,\n\r"]+|"[^"]*"))*$/;
        if (regex.test(csvString)) {
          const ids = csvString.split(',');
          if (ids.length !== LENGTH) {
            throw new Error('Inconsistent keys length.');
          } else {
            return ids.map((id) => id.trim());
          }
        }
        throw new Error('Invalid document id format.');
      } catch (err: any) {
        console.error(err.message);
        return [];
      }
    })();
  }
  getDocumentElements(documentIds: string, LENGTH: number) {
    const keys = this.getCSVFromString(documentIds, LENGTH);
    const getDocumentById = (id: string): Element | null => {
      const found = document.querySelector(`#${id}`);
      const isValid = found !== null && found !== undefined;
      !isValid && console.warn(`Failed to find document id`, id);
      return isValid ? found : null;
    };
    const elements = keys.map((key) => getDocumentById(key));
    return new Map<number, Element | null>(elements.entries());
  }
  getSelectOptionsAsArray(select: HTMLSelectElement): HtmlSelectOption[] {
    const selectOptions: HtmlSelectOption[] = [];
    for (let i = 0; i < select.options.length; i++) {
      const optionTag = select.options[i] as HTMLOptionElement;
      const option = {
        value: optionTag?.value,
        text: optionTag?.text,
        selected: optionTag?.selected,
      } as unknown as HtmlSelectOption;
      selectOptions.push(option);
    }
    return selectOptions;
  }
  createIds(keys: string, componentEnum: any) {
    const ids = this.getDocumentElements(
      keys,
      Object.keys(componentEnum).filter((key) => isNaN(Number(key))).length
    );
    return of(ids);
  }
  htmlInputFormControlPhoneNumberValueChanges(
    prefix: string,
    input$: Observable<HTMLInputElement>,
    control: FormControl<string | null>
  ) {
    if (input$ && control) {
      control.valueChanges
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          switchMap((value) =>
            value
              ? input$.pipe(
                  map((userInput) => {
                    userInput.value = `${
                      prefix.startsWith('+') ? prefix.substring(1) : prefix
                    }${value}`;
                    return userInput;
                  })
                )
              : []
          )
        )
        .subscribe({ error: (e) => console.error(e) });
    }
  }
  htmlInputFormControlValueChanges(
    input$: Observable<HTMLInputElement>,
    control: FormControl<string | null>
  ) {
    if (input$ && control) {
      control.valueChanges
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          switchMap((value) =>
            value
              ? input$.pipe(
                  tap((userInput) => {
                    userInput.value = value;
                  })
                )
              : []
          )
        )
        .subscribe({ error: (e) => console.error(e) });
    }
  }
  htmlSelectFormControlValueChanges(
    select$: Observable<HTMLSelectElement>,
    control: FormControl<string | null>
  ) {
    if (select$ && control) {
      control.valueChanges
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          switchMap((value) =>
            value
              ? select$.pipe(
                  tap((select) => {
                    select.value = value;
                    this.dispatchSelectElementChangeEvent(select);
                  })
                )
              : []
          )
        )
        .subscribe({ error: (e) => console.error(e) });
    }
  }
  initHtmlInputFormControl(
    input$: Observable<HTMLInputElement>,
    control: FormControl
  ) {
    if (input$ && control) {
      input$.subscribe({
        next: (input) => input.value && control.setValue(input.value),
        error: (err) => console.error(err.message),
      });
    }
  }
  initHtmlSelectFormControl(
    input$: Observable<HTMLSelectElement>,
    control: FormControl
  ) {
    if (input$ && control) {
      input$.subscribe({
        next: (select) =>
          select &&
          !AppUtilities.isValueEmptyElement(select) &&
          control.setValue(select.value),
        error: (err) => console.error(err.message),
      });
    }
  }
  initHtmlRadioButtonGroup(
    input$: Observable<NodeListOf<HTMLInputElement>>,
    control: FormControl
  ) {
    if (input$ && control) {
      input$.subscribe({
        next: (inputs) => {
          const firstValue = inputs.length > 0 ? inputs[0].value : null;
          firstValue && control.setValue(firstValue);
        },
        error: (err) => console.error(err),
      });
    }
  }
  htmlRadioButtonGroupValueChanges(
    input$: Observable<NodeListOf<HTMLInputElement>>,
    control: FormControl
  ) {
    if (input$ && control) {
      control.valueChanges
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          switchMap((value) => {
            return input$.pipe(
              tap((inputs) => {
                inputs.forEach(
                  (input) => input.value === value && input.click()
                );
              })
            );
          })
        )
        .subscribe({ error: (e) => console.error(e) });
    }
  }
  setHtmlElementValue(
    input$: Observable<HTMLInputElement | HTMLSelectElement>,
    value: string
  ) {
    input$.subscribe({
      next: (input) => (input.value = value),
      error: (err) => console.error(err.message),
    });
  }
  registerFormControls(controls: THtmlElementControls[]) {
    const elements$ = from(controls);
    const filterControl$ = <T>(
      el: THtmlElementControls,
      controlType: new () => T
    ) => {
      return el[0].pipe(
        filter((control) => control instanceof controlType),
        map(() => el as [Observable<T>, FormControl])
      );
    };
    const htmlInput$ = () => {
      return elements$.pipe(
        switchMap((el) => filterControl$(el, HTMLInputElement)),
        tap(([input$, control]) => {
          const updateInput = (input: HTMLInputElement) =>
            input && control.setValue(input.value);
          input$.subscribe(updateInput);
        }),
        tap(([input$, control]) => {
          const updateInput = (value: string) =>
            input$.subscribe((input) => (input.value = value));
          control.valueChanges
            .pipe(this.unsubscribe.takeUntilDestroy)
            .subscribe(updateInput);
        })
      );
    };
    const htmlTextArea$ = () => {
      return elements$.pipe(
        switchMap((el) => filterControl$(el, HTMLTextAreaElement)),
        tap(([input$, control]) => {
          const updateInput = (input: HTMLTextAreaElement) =>
            input && control.setValue(input.value);
          input$.subscribe(updateInput);
        }),
        tap(([input$, control]) => {
          const updateInput = (value: string) =>
            input$.subscribe((input) => (input.value = value));
          control.valueChanges
            .pipe(this.unsubscribe.takeUntilDestroy)
            .subscribe(updateInput);
        })
      );
    };
    const htmlSelect$ = () => {
      return elements$.pipe(
        switchMap((el) => filterControl$(el, HTMLSelectElement)),
        tap(([select$, control]) => {
          const updateInput = (input: HTMLSelectElement) =>
            input && control.setValue(input.value);
          select$.subscribe(updateInput);
        }),
        tap(([select$, control]) => {
          const updateSelect = (value: string) =>
            select$.subscribe(
              (select) =>
                (select.value = value) &&
                this.dispatchSelectElementChangeEvent(select)
            );
          control.valueChanges
            .pipe(this.unsubscribe.takeUntilDestroy)
            .subscribe(updateSelect);
        })
      );
    };
    const htmlRadioGroup$ = () => {
      return elements$.pipe(
        switchMap((el) => filterControl$(el, NodeList)),
        tap(([nodeList$, control]) =>
          nodeList$
            .pipe(
              map((inputs) =>
                Array.from<HTMLInputElement>(
                  inputs as NodeListOf<HTMLInputElement>
                ).filter((input) => input.checked)
              ),
              filter((e) => e.length === 1),
              tap((e) => control.setValue(e[0].value))
            )
            .subscribe()
        ),
        tap(([nodeList$, control]) =>
          control.valueChanges
            .pipe(
              switchMap((value) =>
                nodeList$.pipe(
                  map(
                    (inputs) =>
                      Array.from<HTMLInputElement>(
                        inputs as NodeListOf<HTMLInputElement>
                      ).find((input) => input.value === value) ?? null
                  ),
                  filterNotNull(),
                  tap((radio) => (radio.checked = true))
                )
              )
            )
            .subscribe()
        )
      );
    };
    return merge(
      htmlInput$(),
      htmlSelect$(),
      htmlRadioGroup$(),
      htmlTextArea$()
    );
  }
  dispatchSelectElementChangeEvent(selectElement: HTMLSelectElement) {
    if (selectElement) {
      let event = new Event('change', { bubbles: true });
      selectElement.dispatchEvent(event);
    }
  }
  getDomElement$<T>(ids$: Observable<MElementPair>, index: number) {
    if (!ids$) return of();
    return ids$.pipe(
      this.unsubscribe.takeUntilDestroy,
      filterNotNull(),
      map((el) => el.get(index) as T)
    );
  }
  getDomElementCheckboxes(ids$: Observable<MElementPair>, index: number) {
    const mapCheckboxLabels = (el: HTMLSpanElement): TCheckboxLabel[] => {
      const checkboxes = el?.querySelectorAll('input[type="checkbox"]') ?? [];
      return Array.from(checkboxes).map((checkbox) => {
        const label = el?.querySelector(`label[for="${checkbox.id}"]`) ?? null;
        return [checkbox as HTMLInputElement, label as HTMLLabelElement]; // 2D array: each row contains a checkbox and its corresponding label
      });
    };
    return this.getDomElement$<HTMLSpanElement>(ids$, index).pipe(
      this.unsubscribe.takeUntilDestroy,
      map(mapCheckboxLabels)
    );
  }
  clickButton(button: HTMLButtonElement | HTMLInputElement) {
    try {
      if (!button) throw new Error('Button is undefined.');
      button.click();
    } catch (err: any) {}
  }
  clickAnchorHref(anchor: HTMLAnchorElement) {
    try {
      if (!anchor) throw new Error('Anchor is undefined.');
      anchor.click();
    } catch (err: any) {
      console.error(err.message);
    }
  }
}
