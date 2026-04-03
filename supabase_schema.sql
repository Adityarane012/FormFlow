-- Tables

-- 1. users
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. forms
CREATE TABLE forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  schema jsonb, -- Store the complete form schema as JSON
  created_at timestamptz DEFAULT now()
);

-- 3. form_fields
CREATE TABLE form_fields (
  id text PRIMARY KEY,
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  label text NOT NULL,
  placeholder text,
  required boolean DEFAULT false,
  order_index integer NOT NULL,
  options jsonb, -- For select/radio options
  show_if jsonb  -- For conditional logic
);

-- 4. responses
CREATE TABLE responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- 5. response_answers
CREATE TABLE response_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES responses(id) ON DELETE CASCADE NOT NULL,
  field_id text REFERENCES form_fields(id) ON DELETE CASCADE NOT NULL,
  value text
);
