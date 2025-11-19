export type ActionResult = {
  ok: boolean;
  message?: string;
};

export type ActionResultWithId = ActionResult & {
  id?: string;
};

export type ActionResultData<T extends object = object> = ActionResult & T;
