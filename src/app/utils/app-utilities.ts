export class AppUtilities {
  static isValueEmptyElement(element: HTMLInputElement | HTMLSelectElement) {
    return !element.value || element.value.length === 0;
  }
}
