<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

namespace App\Traits;

use App\Libraries\ValidationErrors;

trait Validatable
{
    protected $_validationErrors = null;

    abstract public function validationErrorsTranslationPrefix();

    public function validationErrorsKeyBase()
    {
        return 'model_validation.';
    }

    public function validationErrors(): ValidationErrors
    {
        if ($this->_validationErrors === null) {
            $this->_validationErrors = new ValidationErrors(
                $this->validationErrorsTranslationPrefix(),
                $this->validationErrorsKeyBase()
            );
        }

        return $this->_validationErrors;
    }

    private function validateDbFieldLength(int $limit, string $dbField, ?string $checkField = null): void
    {
        if ($this->isDirty($dbField)) {
            $this->validateFieldLength($limit, $dbField, $checkField);
        }
    }

    private function validateDbFieldLengths(): void
    {
        foreach (static::MAX_FIELD_LENGTHS as $field => $limit) {
            $this->validateDbFieldLength($limit, $field, $field);
        }
    }

    private function validateFieldLength(int $limit, string $field, ?string $checkField = null): void
    {
        $checkField ??= $field;
        $val = $this->$checkField;
        if ($val !== null && mb_strlen($val) > $limit) {
            $this->validationErrors()->add($field, 'too_long', ['limit' => $limit]);
        }
    }
}
