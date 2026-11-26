import 'react-native-css-interop/types';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextProps {
    className?: string;
    cssInterop?: boolean;
  }
  interface TextInputProps {
    className?: string;
    placeholderClassName?: string;
    cssInterop?: boolean;
  }
  interface ScrollViewProps {
    className?: string;
    contentContainerClassName?: string;
    cssInterop?: boolean;
  }
  interface PressableProps {
    className?: string;
    cssInterop?: boolean;
  }
}
