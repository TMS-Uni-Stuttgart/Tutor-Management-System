# ❗ Troubleshooting

## Typegoose

### Error: "Type is not a constructor":

If there's a cyclic reference between two schemas make sure to use `{name: SCHEMA_CLASS}` in typegoose `ref` properties. Example where `UserSchema` references `TutorialSchema` and the other way around:

```typescript
export class UserSchema extends Typegoose {
  // ...

  // Use the 'name' of the TutorialSchema here (note: NOT a string!)
  @arrayProp({ required: true, itemsRef: { name: TutorialSchema } })
  tutorials: Ref<TutorialDocument>[];
}

export class TutorialSchema extends Typegoose {
  // ...

  // Use the 'name' if the UserSchema here (note: NOT a string!)
  @prop({ ref: { name: UserSchema } })
  tutor?: Ref<UserDocument>;

  // Use the 'name' if the UserSchema here (note: NOT a string!)
  @arrayProp({ required: true, itemsRef: { name: UserSchema } })
  correctors: Ref<UserDocument>[];
}
```
