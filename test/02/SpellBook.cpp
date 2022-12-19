#include "SpellBook.hpp"

SpellBook::SpellBook()
{
}

SpellBook::~SpellBook()
{
    std::map<std::string, ASpell *>::iterator it_begin = this->list.begin();
    std::map<std::string, ASpell *>::iterator it_end = this->list.end();
    while (it_begin != it_end)
    {
        delete it_begin->second;
        ++it_begin;
    }
    this->list.clear();
}

void    SpellBook::learnSpell(ASpell *other)
{
    if (other)
        this->list.insert(std::pair<std::string, ASpell *>(other->getName(), other->clone()));
}

void    SpellBook::forgetSpell(std::string const &name)
{
    std::map<std::string, ASpell *>::iterator it = this->list.find(name);
    if (it != this->list.begin())
        delete it->second;
    this->list.erase(name);
}

ASpell* SpellBook::createSpell(std::string const &spell_name)
{
    std::map<std::string, ASpell *>::iterator it = this->list.find(spell_name);
    if (it != this->list.end())
        return this->list[spell_name];
    return NULL;
}