#pragma once
#include <iostream>

#include "ASpell.hpp"

class Polymorph : public ASpell
{
    public:
        Polymorph(void);
        ~Polymorph();
        
        virtual ASpell *clone(void) const;
};